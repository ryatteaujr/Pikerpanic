import Phaser from 'phaser';
import { getLevelConfig, getNextLevelNumber, levelConfig, type TicketItemType, type WarehouseLevelConfig } from '../config/levelConfig';
import { scoringConfig } from '../config/scoringConfig';
import { Chute } from '../objects/Chute';
import { ForkliftHazard } from '../objects/ForkliftHazard';
import { PedestrianHazard } from '../objects/PedestrianHazard';
import { Pickup } from '../objects/Pickup';
import { PlayerTruck } from '../objects/PlayerTruck';
import { TicketItem } from '../objects/TicketItem';
import { getGrade } from '../systems/GradeManager';
import { HudManager } from '../systems/HudManager';
import { InputManager } from '../systems/InputManager';
import { ScoreManager } from '../systems/ScoreManager';
import { playSoundEffect } from '../systems/SoundEffectManager';
import { registerSoundToggle } from '../systems/SoundToggle';
import { TicketManager } from '../systems/TicketManager';
import { getLoadPerformancePerHour } from '../systems/TimerManager';
import { pickTruckConfig } from '../config/vehicleConfig';

export class GameScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private hud = new HudManager();
  private player!: PlayerTruck;
  private forklifts: ForkliftHazard[] = [];
  private pedestrians: PedestrianHazard[] = [];
  private chute!: Chute;
  private coldChute?: Chute;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private pickups!: Phaser.Physics.Arcade.StaticGroup;
  private ticketItems: TicketItem[] = [];
  private score = new ScoreManager(scoringConfig);
  private ticket = new TicketManager(levelConfig.requiredItems, pickTruckConfig.capacity);
  private lives = levelConfig.lives;
  private elapsedSeconds = 0;
  private remainingSeconds = levelConfig.timerSeconds;
  private combo = 0;
  private paused = false;
  private message = 'Pick all ticket items and unload at Chute 06.';
  private lastForkliftHitAt = -2000;
  private coldDeadline = 0;
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicIndex = 0;
  private readonly respawn = new Phaser.Math.Vector2(184, 544);
  private activeLevel: WarehouseLevelConfig = levelConfig;

  constructor() {
    super('GameScene');
  }

  create(data: { level?: number } = {}): void {
    registerSoundToggle(this);
    this.activeLevel = getLevelConfig(data.level ?? 1);
    this.score = new ScoreManager(scoringConfig);
    this.ticket = new TicketManager(this.activeLevel.requiredItems, pickTruckConfig.capacity);
    this.lives = this.activeLevel.lives;
    this.elapsedSeconds = 0;
    this.remainingSeconds = this.activeLevel.timerSeconds;
    this.combo = 0;
    this.paused = false;
    this.message = `Level ${this.activeLevel.level}: pick all items and unload at Chute ${this.activeLevel.chute}.`;
    this.lastForkliftHitAt = -2000;
    this.coldDeadline = 0;
    this.ticketItems = [];
    this.forklifts = [];
    this.pedestrians = [];

    this.inputManager = new InputManager(this);
    this.physics.world.setBounds(156, this.activeLevel.hudHeight, 648, 470);
    this.drawWarehouse();
    this.createWalls();
    this.createPickups();
    this.createTicketItems();

    this.chute = new Chute(this, this.activeLevel.chutePosition.x, this.activeLevel.chutePosition.y, this.activeLevel.chute);
    if (this.activeLevel.coldChute) {
      this.coldChute = new Chute(this, this.activeLevel.coldChute.x, this.activeLevel.coldChute.y, this.activeLevel.coldChute.id);
    } else {
      this.coldChute = undefined;
    }

    this.player = new PlayerTruck(this, this.respawn.x, this.respawn.y);
    this.createHazards();

    this.physics.add.collider(this.player, this.walls);
    for (const forklift of this.forklifts) {
      this.physics.add.collider(forklift, this.walls);
      this.physics.add.overlap(this.player, forklift, () => this.hitForklift());
    }
    for (const pedestrian of this.pedestrians) {
      this.physics.add.collider(this.player, pedestrian, () => {
        this.message = 'Worker in the aisle - go around.';
      });
    }
    this.physics.add.overlap(this.player, this.pickups, (_player, pickup) => this.collectPickup(pickup as Pickup));

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickTimer(),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusicPlaylist());
    this.startMusicPlaylist();

    this.hud.render(this.hudState());
  }

  update(): void {
    if (this.inputManager.pausePressed()) {
      this.paused = !this.paused;
      this.message = this.paused ? 'Paused' : 'Back on the clock.';
    }

    if (this.paused) {
      this.player.stop();
      this.hud.render(this.hudState());
      return;
    }

    this.player.move(this.inputManager.movement());
    for (const forklift of this.forklifts) {
      forklift.updatePatrol();
    }
    for (const pedestrian of this.pedestrians) {
      pedestrian.updatePatrol();
    }
    this.checkColdChainTimer();
    this.updateActionGlows();

    if (this.inputManager.pickPressed()) {
      this.tryPickTicketItem();
    }

    if (this.inputManager.unloadPressed()) {
      this.tryUnload();
    }

    this.hud.render(this.hudState());
  }

  private drawWarehouse(): void {
    this.add.rectangle(480, 372, 960, 536, 0x1f282b);
    this.add.rectangle(480, 339, 648, 470, 0x222d31, 0.84).setStrokeStyle(2, 0x36515d).setDepth(0);
    this.add.rectangle(480, 104, 960, 4, 0xf0c44c);

    for (let x = 166; x < 805; x += 40) {
      this.add.line(0, 0, x, this.activeLevel.hudHeight, x, this.activeLevel.height, 0x344149, 0.24).setOrigin(0);
    }

    for (let y = this.activeLevel.hudHeight + 36; y < 570; y += 58) {
      this.add.line(0, 0, 166, y, 794, y, 0x27323a, 0.35).setOrigin(0);
    }

    this.drawLaneMarkings();
    this.drawFloorArrows();

    const labelXs = [184, 238, 292, 346, 400, 454, 508, 562, 616, 670, 724, 778];
    labelXs.forEach((x, index) => {
      this.add
        .text(x, 116, String.fromCharCode(65 + index), {
          color: '#f4d35e',
          fontFamily: 'Arial Black',
          fontSize: '13px',
        })
        .setOrigin(0.5);
    });

    this.add.rectangle(168, 558, 116, 26, 0x071019, 0.92).setStrokeStyle(2, 0x86d8ff).setDepth(6);
    this.add.text(168, 558, 'SAFE START', {
      color: '#86d8ff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '12px',
      fixedWidth: 104,
      align: 'center',
    }).setOrigin(0.5).setDepth(7);
  }

  private createWalls(): void {
    this.walls = this.physics.add.staticGroup();
    const racks = [
      [300, 184, 96, 36],
      [300, 314, 96, 36],
      [300, 444, 96, 36],
      [480, 184, 136, 36],
      [480, 314, 136, 36],
      [480, 444, 136, 36],
      [690, 184, 112, 36],
      [690, 314, 112, 36],
      [690, 444, 112, 36],
      [480, 558, 250, 22],
    ];

    for (const [x, y, width, height] of racks) {
      this.drawRackBay(x, y, width, height);
      const rackBody = this.add.rectangle(x, y, width, height, 0x000000, 0);
      this.physics.add.existing(rackBody, true);
      this.walls.add(rackBody);
    }
  }

  private createPickups(): void {
    this.pickups = this.physics.add.staticGroup();
    const points = [
      [184, 146], [184, 238], [184, 364], [184, 508],
      [332, 146], [332, 254], [332, 382], [332, 520],
      [390, 238], [390, 364], [390, 508],
      [590, 146], [590, 254], [590, 382], [590, 520],
      [770, 146], [770, 238], [770, 364], [770, 508],
      [430, 520], [628, 520],
    ];

    for (const [x, y] of points) {
      this.pickups.add(new Pickup(this, x, y));
    }
  }

  private createTicketItems(): void {
    for (const { x, y, type } of this.activeLevel.ticketItems) {
      this.ticketItems.push(new TicketItem(this, x, y, type));
    }
  }

  private createHazards(): void {
    for (const forkliftConfig of this.activeLevel.forklifts) {
      const points = forkliftConfig.points.map((point) => new Phaser.Math.Vector2(point.x, point.y));
      const start = points[0];
      this.forklifts.push(new ForkliftHazard(this, start.x, start.y, points));
    }

    for (const pedestrianConfig of this.activeLevel.pedestrians) {
      const area = new Phaser.Geom.Rectangle(
        pedestrianConfig.area.x,
        pedestrianConfig.area.y,
        pedestrianConfig.area.width,
        pedestrianConfig.area.height,
      );
      this.pedestrians.push(new PedestrianHazard(this, pedestrianConfig.x, pedestrianConfig.y, area));
    }
  }

  private collectPickup(pickup: Pickup): void {
    this.showPickupPop(pickup.x, pickup.y);
    playSoundEffect('pickup');
    pickup.destroy();
    this.score.addRegularBox();
    this.message = '+10 regular box';
  }

  private tryPickTicketItem(): void {
    const nearby = this.ticketItems.find((item) => !item.picked && Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y) < 48);
    if (!nearby) {
      this.combo = 0;
      this.score.addWrongPickPenalty();
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 5);
      this.message = 'Wrong location - time penalty.';
      return;
    }

    const result = this.ticket.pick(nearby.itemType);
    if (!result.ok) {
      if (result.reason === 'full') {
        this.message = 'Truck full - return to chute.';
      } else {
        this.combo = 0;
        this.score.addWrongPickPenalty();
        this.remainingSeconds = Math.max(0, this.remainingSeconds - 5);
        this.message = 'Wrong item - check the ticket.';
      }
      return;
    }

    nearby.markPicked();
    playSoundEffect('pickup');
    if (nearby.itemType === 'Freezer Pack' && this.coldDeadline === 0) {
      this.coldDeadline = this.time.now + 20_000;
    }
    this.combo += 1;
    this.score.addCorrectPick(this.combo);
    this.message = nearby.itemType === 'Freezer Pack'
      ? 'Freezer Pack picked - get it to Chute 03.'
      : `${nearby.itemType} picked. Combo x${this.combo}.`;
  }

  private tryUnload(): void {
    const nearRegularChute = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.chute.x, this.chute.y) <= 70;
    const nearColdChute = this.coldChute
      ? Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coldChute.x, this.coldChute.y) <= 70
      : false;

    if (!nearRegularChute && !nearColdChute) {
      this.message = `Drive to Chute ${this.activeLevel.chute} to unload.`;
      return;
    }

    const isColdUnload = nearColdChute && this.ticket.isCarrying('Freezer Pack');
    const acceptedTypes: TicketItemType[] = isColdUnload
      ? ['Freezer Pack']
      : this.activeLevel.requiredItems.map((line) => line.type).filter((type) => type !== 'Freezer Pack');
    const result = this.ticket.unloadTypes(acceptedTypes);
    if (result.unloaded === 0) {
      this.message = isColdUnload ? 'No freezer freight on truck.' : 'No regular items for this chute.';
      return;
    }

    if (isColdUnload && !this.ticket.isCarrying('Freezer Pack')) {
      this.coldDeadline = 0;
    }

    this.score.addUnload();
    playSoundEffect('dropoff');
    const chuteId = isColdUnload ? this.activeLevel.coldChute?.id : this.activeLevel.chute;
    this.message = `Unloaded ${result.unloaded} item${result.unloaded === 1 ? '' : 's'} at Chute ${chuteId}.`;

    if (result.completed) {
      this.score.addCompletionBonus(this.remainingSeconds);
      const nextLevel = getNextLevelNumber(this.activeLevel.level);
      this.scene.start('LevelCompleteScene', {
        level: this.activeLevel.level,
        nextLevel,
        score: this.score.value,
        remainingSeconds: this.remainingSeconds,
        accuracy: this.ticket.accuracyPercent,
        lph: getLoadPerformancePerHour(this.ticket.completedCount, this.elapsedSeconds),
        lives: this.lives,
        grade: getGrade({
          accuracy: this.ticket.accuracyPercent,
          lives: this.lives,
          remainingSeconds: this.remainingSeconds,
        }),
      });
    }
  }

  private hitForklift(): void {
    if (this.time.now - this.lastForkliftHitAt < 1200) {
      return;
    }
    this.lastForkliftHitAt = this.time.now;
    this.lives -= 1;
    this.combo = 0;
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 5);
    const fragilePenalty = this.ticket.isCarrying('Fragile');
    if (fragilePenalty) {
      this.ticket.recordFragileBreakage();
      this.score.addWrongPickPenalty();
    }
    playSoundEffect('crash');
    this.showCollisionFeedback();
    this.player.setPosition(this.respawn.x, this.respawn.y);
    this.player.stop();
    this.message = fragilePenalty ? 'Fragile freight damaged - accuracy hit.' : 'Forklift collision - life lost.';

    if (this.lives <= 0) {
      this.scene.start('GameOverScene', {
        score: this.score.value,
        picks: `${this.ticket.completedCount} / ${this.ticket.totalRequired}`,
        accuracy: this.ticket.accuracyPercent,
        reason: 'Lives reached zero.',
      });
    }
  }

  private checkColdChainTimer(): void {
    if (this.coldDeadline === 0 || !this.ticket.isCarrying('Freezer Pack')) {
      return;
    }
    const remaining = Math.ceil((this.coldDeadline - this.time.now) / 1000);
    if (remaining <= 0) {
      this.scene.start('GameOverScene', {
        score: this.score.value,
        picks: `${this.ticket.completedCount} / ${this.ticket.totalRequired}`,
        accuracy: this.ticket.accuracyPercent,
        reason: 'Freezer freight warmed up.',
      });
      return;
    }
    if (remaining <= 5) {
      this.message = `Cold chain critical: ${remaining}s to Chute 03.`;
    }
  }

  private tickTimer(): void {
    if (this.paused) {
      return;
    }

    this.elapsedSeconds += 1;
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
    if (this.remainingSeconds === 30) {
      this.message = 'Truck leaves in 30 seconds.';
    }
    if (this.remainingSeconds <= 0) {
      this.scene.start('GameOverScene', {
        score: this.score.value,
        picks: `${this.ticket.completedCount} / ${this.ticket.totalRequired}`,
        accuracy: this.ticket.accuracyPercent,
        reason: 'The truck left without you.',
      });
    }
  }

  private hudState() {
    return {
      remainingSeconds: this.remainingSeconds,
      elapsedSeconds: this.elapsedSeconds,
      lives: this.lives,
      score: this.score.value,
      combo: this.combo,
      message: this.message,
      ticket: this.ticket,
      level: this.activeLevel,
    };
  }

  private drawRackBay(x: number, y: number, width: number, height: number): void {
    this.add.rectangle(x + 4, y + 5, width, height, 0x090d11, 0.45).setDepth(1);
    this.add.rectangle(x, y, width, height, 0x111923).setStrokeStyle(3, 0xf0c44c).setDepth(2);
    this.add.rectangle(x, y - height / 2 + 5, width - 10, 8, 0x071018, 0.78).setDepth(3);

    const uprightCount = Math.max(2, Math.floor(width / 48));
    for (let i = 0; i <= uprightCount; i += 1) {
      const uprightX = x - width / 2 + 8 + (i * (width - 16)) / uprightCount;
      this.add.rectangle(uprightX, y, 6, height + 8, 0x2c83c6).setStrokeStyle(1, 0x7fd8ff).setDepth(4);
    }

    const cartonRows = height > 32 ? 2 : 1;
    const cartonWidth = 22;
    const cartonHeight = 11;
    for (let row = 0; row < cartonRows; row += 1) {
      for (let cx = x - width / 2 + 24; cx < x + width / 2 - 18; cx += 28) {
        const cy = y - 5 + row * 12;
        this.add.rectangle(cx, cy, cartonWidth, cartonHeight, 0xd87922).setStrokeStyle(1, 0x6e3811).setDepth(5);
        this.add.rectangle(cx - 3, cy - 3, cartonWidth - 8, 2, 0xffb15a, 0.75).setDepth(6);
      }
    }
  }

  private drawLaneMarkings(): void {
    const verticalLanes = [
      { x: 180, y1: 132, y2: 548 },
      { x: 356, y1: 132, y2: 548 },
      { x: 590, y1: 132, y2: 548 },
      { x: 770, y1: 132, y2: 548 },
    ];

    for (const lane of verticalLanes) {
      for (let y = lane.y1; y < lane.y2; y += 30) {
        this.add.rectangle(lane.x, y, 4, 16, 0xf4d35e, 0.65).setDepth(1);
      }
    }

    for (let x = 184; x < 778; x += 34) {
      this.add.rectangle(x, 535, 18, 4, 0xf4d35e, 0.65).setDepth(1);
    }
  }

  private drawFloorArrows(): void {
    const arrows: Array<[number, number, number]> = [
      [184, 292, 0],
      [356, 512, 0],
      [590, 210, Math.PI],
      [770, 462, Math.PI],
      [704, 512, Math.PI / 2],
    ];

    for (const [x, y, rotation] of arrows) {
      const arrow = this.add.container(x, y).setRotation(rotation).setDepth(1);
      arrow.add([
        this.add.rectangle(0, 0, 28, 6, 0xf4d35e, 0.48),
        this.add.triangle(18, 0, -8, -11, -8, 11, 12, 0, 0xf4d35e, 0.48),
      ]);
    }
  }

  private updateActionGlows(): void {
    for (const item of this.ticketItems) {
      const nearby = !item.picked && Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y) < 56;
      item.setActionGlow(nearby);
    }

    const nearChute = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.chute.x, this.chute.y) <= 78;
    this.chute.setActionGlow(nearChute);
    if (this.coldChute) {
      const nearColdChute = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coldChute.x, this.coldChute.y) <= 78;
      this.coldChute.setActionGlow(nearColdChute);
    }
  }

  private showPickupPop(x: number, y: number): void {
    const flash = this.add.rectangle(x, y, 20, 18, 0xfff1a6, 0.82).setStrokeStyle(2, 0xffffff).setDepth(30);
    const plus = this.add
      .text(x, y - 18, '+10', {
        color: '#fff4a8',
        fontFamily: 'Arial Black',
        fontSize: '12px',
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.9,
      scaleY: 1.7,
      duration: 180,
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: plus,
      alpha: 0,
      y: y - 34,
      duration: 280,
      onComplete: () => plus.destroy(),
    });
  }

  private showCollisionFeedback(): void {
    this.cameras.main.shake(150, 0.008);
    const flash = this.add.rectangle(480, 372, 960, 536, 0xff2a2a, 0.18).setDepth(100);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 140,
      onComplete: () => flash.destroy(),
    });
  }

  private startMusicPlaylist(): void {
    this.stopMusicPlaylist();
    this.currentMusicIndex = 0;
    this.playCurrentMusic();
  }

  private playCurrentMusic(): void {
    const key = this.activeLevel.musicKeys[this.currentMusicIndex];
    this.currentMusic = this.sound.add(key, { volume: 0.58 });
    this.currentMusic.once('complete', () => {
      this.currentMusic?.destroy();
      this.currentMusicIndex = (this.currentMusicIndex + 1) % this.activeLevel.musicKeys.length;
      this.playCurrentMusic();
    });
    this.currentMusic.play();
  }

  private stopMusicPlaylist(): void {
    for (const key of this.activeLevel.musicKeys) {
      this.sound.stopByKey(key);
    }
    this.currentMusic?.destroy();
    this.currentMusic = undefined;
  }
}
