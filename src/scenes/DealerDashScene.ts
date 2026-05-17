import Phaser from 'phaser';
import { getDealerDashLevelConfig, type DealerDashLevelConfig, type DealerStop, type DealerTraffic } from '../config/dealerDashConfig';
import { GamepadManager } from '../systems/GamepadManager';
import { registerSoundToggle } from '../systems/SoundToggle';
import { playSoundEffect } from '../systems/SoundEffectManager';
import { getDealerDashInput, isTruckInDealerDeliveryZone } from './dealerDashInput';

interface TrafficRig {
  visual: Phaser.GameObjects.Container;
  config: DealerTraffic;
}

const PLAYFIELD = { left: 52, right: 908, top: 116, bottom: 584 };
const TRUCK_SPEED = 205;
const DAMAGE_COOLDOWN_MS = 900;

export class DealerDashScene extends Phaser.Scene {
  private level!: DealerDashLevelConfig;
  private truck!: Phaser.GameObjects.Container;
  private truckBody!: Phaser.Physics.Arcade.Body;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly gamepad = new GamepadManager();
  private gamepadSnapshot = this.gamepad.snapshot();
  private traffic: TrafficRig[] = [];
  private targetIndex = 0;
  private score = 0;
  private remainingSeconds = 0;
  private damage = 0;
  private combo = 1;
  private lastHitAt = -DAMAGE_COOLDOWN_MS;
  private status = 'Choose the highlighted dealer, then dock clean.';
  private hud?: Phaser.GameObjects.Container;
  private dealerStopLayer?: Phaser.GameObjects.Container;
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicIndex = 0;

  constructor() {
    super('DealerDashScene');
  }

  create(data: { level?: number } = {}): void {
    registerSoundToggle(this);
    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    const level = getDealerDashLevelConfig(data.level ?? 13);
    if (!level) {
      throw new Error(`Dealer-Dash level ${data.level ?? 13} is not configured.`);
    }

    this.level = level;
    this.remainingSeconds = level.timerSeconds;
    this.damage = 0;
    this.combo = 1;
    this.score = 0;
    this.targetIndex = 0;
    this.status = 'Dispatch says: dealer needs it by five.';
    this.traffic = [];
    this.currentMusicIndex = 0;

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,E,SPACE,B') as Record<string, Phaser.Input.Keyboard.Key>;

    this.drawWorld();
    this.drawDealerStops();
    this.drawHazards();
    this.createTraffic();
    this.createTruck();
    this.drawHud();

    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tickTimer() });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusicPlaylist());
    this.startMusicPlaylist();
  }

  update(_time: number, delta: number): void {
    this.handleTruckMovement();
    this.updateTraffic(delta / 1000);
    this.checkTrafficHits();
    this.checkHazardHits();
    this.checkDelivery();
  }

  private drawWorld(): void {
    this.add.rectangle(480, 320, 960, 640, 0x10314c);
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x2c5b76, 0.34);
    for (let x = 0; x <= 960; x += 64) {
      grid.lineBetween(x, 0, x, 640);
    }
    for (let y = 0; y <= 640; y += 64) {
      grid.lineBetween(0, y, 960, y);
    }

    this.add.rectangle(480, 48, 960, 94, 0x071018).setStrokeStyle(4, 0xf0c44c);
    this.add.rectangle(480, 350, 900, 496, 0x163047, 0.78).setStrokeStyle(3, 0x377da7);

    this.drawRoad(480, 232, 720, 76);
    this.drawRoad(480, 374, 720, 76);
    this.drawRoad(286, 328, 82, 260);
    this.drawRoad(716, 328, 82, 260);
    this.drawRoad(480, 500, 760, 76);
    this.drawRoad(480, 328, 82, 260);

    this.add.rectangle(108, 548, 128, 54, 0x154b5f).setStrokeStyle(4, 0x63dfff).setDepth(12);
    this.add.text(108, 548, 'WAREHOUSE\nSTART', {
      align: 'center',
      color: '#d8f8ff',
      fontFamily: 'Arial Black, Arial',
      fontSize: '13px',
    }).setOrigin(0.5).setDepth(13);

    this.add.text(156, 22, 'HOUSE-HASSON HARDWARE', {
      color: '#f0c44c',
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
    }).setOrigin(0.5);
    this.add.text(480, 22, 'DEALER-DASH', {
      color: '#ff5c7a',
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
    }).setOrigin(0.5);
    this.add.text(480, 50, this.level.subtitle.toUpperCase(), {
      color: '#d9e4ff',
      fontFamily: 'Arial',
      fontSize: '14px',
    }).setOrigin(0.5);
  }

  private drawRoad(x: number, y: number, width: number, height: number): void {
    const road = this.add.rectangle(x, y, width, height, 0x202a31).setStrokeStyle(3, 0x49535b);
    road.setDepth(1);
    const lane = this.add.graphics().setDepth(2);
    lane.lineStyle(3, 0xf0c44c, 0.7);
    if (width > height) {
      for (let dashX = x - width / 2 + 22; dashX < x + width / 2 - 14; dashX += 58) {
        lane.lineBetween(dashX, y, dashX + 28, y);
      }
    } else {
      for (let dashY = y - height / 2 + 20; dashY < y + height / 2 - 14; dashY += 56) {
        lane.lineBetween(x, dashY, x, dashY + 28);
      }
    }
  }

  private drawDealerStops(): void {
    this.dealerStopLayer?.destroy();
    this.dealerStopLayer = this.add.container(0, 0).setDepth(10);
    this.level.dealerStops.forEach((stop, index) => {
      const active = index === this.targetIndex;
      this.dealerStopLayer?.add(
        this.add.rectangle(stop.x, stop.y, 158, 82, active ? 0x233d27 : 0x17242a).setStrokeStyle(4, stop.color),
      );
      this.dealerStopLayer?.add(this.add.text(stop.x, stop.y - 18, stop.name.toUpperCase(), {
        align: 'center',
        color: '#f6f0cf',
        fontFamily: 'Arial Black, Arial',
        fontSize: '12px',
        wordWrap: { width: 140 },
      }).setOrigin(0.5));
      this.dealerStopLayer?.add(this.add.text(stop.x, stop.y + 20, stop.cargo.toUpperCase(), {
        align: 'center',
        color: '#d9e4ff',
        fontFamily: 'Arial',
        fontSize: '12px',
      }).setOrigin(0.5));
    });
  }

  private drawHazards(): void {
    for (const hazard of this.level.hazards) {
      this.add.rectangle(hazard.x, hazard.y, hazard.width, hazard.height, 0xd77c24).setStrokeStyle(2, 0xffd47a).setDepth(6);
      this.add.text(hazard.x, hazard.y, hazard.label, {
        color: '#fff4c8',
        fontFamily: 'Arial Black, Arial',
        fontSize: '9px',
      }).setOrigin(0.5).setDepth(7);
    }
  }

  private createTruck(): void {
    this.truck = this.add.container(this.level.truckSpawn.x, this.level.truckSpawn.y).setDepth(30);
    this.truck.add(this.createSemiTruckVisual());
    this.physics.add.existing(this.truck);
    this.truckBody = this.truck.body as Phaser.Physics.Arcade.Body;
    this.truckBody.setSize(96, 36);
    this.truckBody.setOffset(-48, -18);
    this.truckBody.setAllowGravity(false);
    this.truckBody.setCollideWorldBounds(true);
  }

  private createSemiTruckVisual(): Phaser.GameObjects.Container {
    const rig = this.add.container(0, 0);
    const shadow = this.add.ellipse(-12, 8, 136, 40, 0x000000, 0.38);
    const trailer = this.add.rectangle(-28, 0, 82, 34, 0xe7edf0).setStrokeStyle(3, 0x364550);
    const trailerDoor = this.add.rectangle(-68, 0, 8, 30, 0xb9c5c9).setStrokeStyle(1, 0x364550);
    const stripe = this.add.rectangle(-28, 0, 78, 8, 0xf0c44c);
    const cab = this.add.rectangle(28, 0, 42, 38, 0xd94d24).setStrokeStyle(3, 0x3f210e);
    const hood = this.add.rectangle(56, 0, 24, 30, 0xf39a22).setStrokeStyle(2, 0x3f210e);
    const windshield = this.add.rectangle(34, -8, 18, 12, 0x7fe7ff).setStrokeStyle(1, 0xffffff);
    const grille = this.add.rectangle(70, 0, 5, 22, 0xcfd9df);
    const leftHeadlight = this.add.rectangle(74, -10, 4, 5, 0xfff2a0);
    const rightHeadlight = this.add.rectangle(74, 10, 4, 5, 0xfff2a0);
    const logo = this.add.text(-28, 0, 'HH', {
      color: '#10251b',
      fontFamily: 'Arial Black, Arial',
      fontSize: '12px',
    }).setOrigin(0.5);

    for (const wheelX of [-64, -38, 20, 48]) {
      rig.add(this.add.rectangle(wheelX, -23, 14, 7, 0x111820).setStrokeStyle(1, 0x7a8790));
      rig.add(this.add.rectangle(wheelX, 23, 14, 7, 0x111820).setStrokeStyle(1, 0x7a8790));
    }

    rig.add([shadow, trailer, trailerDoor, stripe, cab, hood, windshield, grille, leftHeadlight, rightHeadlight, logo]);
    return rig;
  }

  private createTraffic(): void {
    for (const traffic of this.level.traffic) {
      const visual = this.add.container(traffic.x, traffic.y).setDepth(22);
      visual.add(this.add.ellipse(0, 8, 62, 20, 0x000000, 0.32));
      visual.add(this.add.rectangle(0, 0, 48, 24, traffic.color).setStrokeStyle(2, 0x111820));
      visual.add(this.add.rectangle(12, -4, 14, 8, 0x7fe7ff));
      visual.add(this.add.rectangle(-18, 0, 6, 18, 0x27323a));
      visual.add(this.add.text(0, 0, traffic.label, {
        color: '#ffffff',
        fontFamily: 'Arial Black, Arial',
        fontSize: '8px',
      }).setOrigin(0.5));
      visual.rotation = traffic.speed > 0 ? 0 : Math.PI;
      this.traffic.push({ visual, config: traffic });
    }
  }

  private handleTruckMovement(): void {
    this.gamepadSnapshot = this.gamepad.snapshot();
    const input = getDealerDashInput({
      keyboard: {
        left: Boolean(this.cursors?.left.isDown || this.keys.A.isDown),
        right: Boolean(this.cursors?.right.isDown || this.keys.D.isDown),
        up: Boolean(this.cursors?.up.isDown || this.keys.W.isDown),
        down: Boolean(this.cursors?.down.isDown || this.keys.S.isDown),
        deliver: false,
      },
      gamepad: this.gamepadSnapshot,
    });
    const { left, right, up, down } = input;
    const velocityX = (right ? TRUCK_SPEED : 0) - (left ? TRUCK_SPEED : 0);
    const velocityY = (down ? TRUCK_SPEED : 0) - (up ? TRUCK_SPEED : 0);
    this.truckBody.setVelocity(velocityX, velocityY);
    if (velocityX !== 0 && velocityY !== 0) {
      this.truckBody.velocity.normalize().scale(TRUCK_SPEED);
    }

    if (Math.abs(this.truckBody.velocity.x) > Math.abs(this.truckBody.velocity.y)) {
      this.truck.rotation = this.truckBody.velocity.x >= 0 ? 0 : Math.PI;
    } else if (Math.abs(this.truckBody.velocity.y) > 1) {
      this.truck.rotation = this.truckBody.velocity.y >= 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    this.truck.setPosition(
      Phaser.Math.Clamp(this.truck.x, PLAYFIELD.left, PLAYFIELD.right),
      Phaser.Math.Clamp(this.truck.y, PLAYFIELD.top, PLAYFIELD.bottom),
    );
  }

  private updateTraffic(deltaSeconds: number): void {
    for (const traffic of this.traffic) {
      traffic.visual.x += traffic.config.speed * deltaSeconds;
      if (traffic.config.speed > 0 && traffic.visual.x > traffic.config.maxX) {
        traffic.visual.x = traffic.config.minX;
      }
      if (traffic.config.speed < 0 && traffic.visual.x < traffic.config.minX) {
        traffic.visual.x = traffic.config.maxX;
      }
    }
  }

  private checkTrafficHits(): void {
    for (const traffic of this.traffic) {
      if (Phaser.Math.Distance.Between(this.truck.x, this.truck.y, traffic.visual.x, traffic.visual.y) < 48) {
        this.damageTruck(12, 'Traffic scrape. Damage up.');
        return;
      }
    }
  }

  private checkHazardHits(): void {
    for (const hazard of this.level.hazards) {
      if (
        Math.abs(this.truck.x - hazard.x) < hazard.width / 2 + 32 &&
        Math.abs(this.truck.y - hazard.y) < hazard.height / 2 + 22
      ) {
        this.damageTruck(7, `${hazard.label} clipped the load.`);
        return;
      }
    }
  }

  private checkDelivery(): void {
    const stop = this.level.dealerStops[this.targetIndex];
    if (!stop) {
      return;
    }

    const closeEnough = isTruckInDealerDeliveryZone(this.truck, stop);
    if (!closeEnough) {
      return;
    }

    this.status = `Dock at ${stop.name}. Press E, Space, or B.`;
    const input = getDealerDashInput({
      keyboard: {
        left: false,
        right: false,
        up: false,
        down: false,
        deliver: Boolean(
          Phaser.Input.Keyboard.JustDown(this.keys.E) ||
          Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
          Phaser.Input.Keyboard.JustDown(this.keys.B)
        ),
      },
      gamepad: this.gamepadSnapshot,
    });
    if (input.deliver) {
      this.completeDelivery(stop);
    } else {
      this.drawHud();
    }
  }

  private completeDelivery(stop: DealerStop): void {
    this.targetIndex += 1;
    const cleanBonus = Math.max(0, 100 - this.damage) * 12;
    this.score += stop.score * this.combo + cleanBonus;
    this.remainingSeconds += stop.bonusSeconds;
    this.combo += 1;
    this.status = `${stop.name} unloaded. ${stop.bonusSeconds}s bonus.`;
    playSoundEffect('dropoff');
    this.cameras.main.flash(120, 141, 255, 177, false);

    if (this.targetIndex >= this.level.dealerStops.length) {
      this.scene.start('WinnerCreditsScene');
      return;
    }

    this.drawDealerStops();
    this.drawHud();
  }

  private damageTruck(amount: number, message: string): void {
    if (this.time.now - this.lastHitAt < DAMAGE_COOLDOWN_MS) {
      return;
    }

    this.lastHitAt = this.time.now;
    this.damage = Math.min(this.level.damageLimit, this.damage + amount);
    this.combo = 1;
    this.status = message;
    playSoundEffect('crash');
    this.cameras.main.shake(140, 0.006);
    if (this.damage >= this.level.damageLimit) {
      this.gameOver('Truck totaled before the dealers were served.');
      return;
    }
    this.drawHud();
  }

  private tickTimer(): void {
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
    if (this.remainingSeconds <= 0) {
      this.gameOver('The dealer route timed out.');
      return;
    }
    this.drawHud();
  }

  private drawHud(): void {
    this.hud?.destroy();
    this.hud = this.add.container(0, 0).setDepth(80);
    const currentStop = this.level.dealerStops[this.targetIndex];
    const panels = [
      { x: 70, width: 108, title: '1UP', value: `${this.score.toString().padStart(6, '0')}` },
      { x: 188, width: 90, title: 'LEVEL', value: '10' },
      { x: 352, width: 218, title: 'TARGET', value: currentStop ? currentStop.name.toUpperCase() : 'ROUTE CLEAR' },
      { x: 542, width: 112, title: 'CARGO', value: `${Math.max(0, 100 - this.damage)}%` },
      { x: 680, width: 104, title: 'COMBO', value: `x${this.combo}` },
      { x: 812, width: 104, title: 'TIME', value: `${this.remainingSeconds.toString().padStart(3, '0')}` },
    ];

    for (const panel of panels) {
      this.hud.add(this.add.rectangle(panel.x, 88, panel.width, 48, 0x0b2235).setStrokeStyle(2, 0x5fb6e8));
      this.hud.add(this.add.text(panel.x, 76, panel.title, {
        color: panel.title === 'TIME' ? '#ff5c7a' : '#f0c44c',
        fontFamily: 'Arial Black, Arial',
        fontSize: '12px',
      }).setOrigin(0.5));
      this.hud.add(this.add.text(panel.x, 96, panel.value, {
        align: 'center',
        color: '#f6f0cf',
        fontFamily: 'Arial Black, Arial',
        fontSize: panel.value.length > 15 ? '10px' : '16px',
        wordWrap: { width: panel.width - 12 },
      }).setOrigin(0.5));
    }

    this.hud.add(this.add.rectangle(480, 612, 650, 32, 0x071018, 0.86).setStrokeStyle(2, 0xf0c44c));
    this.hud.add(this.add.text(480, 612, `${this.status}   Controls: Arrows/WASD drive | E/Space/B deliver | M sound`, {
      color: '#d9e4ff',
      fontFamily: 'Arial',
      fontSize: '14px',
    }).setOrigin(0.5));
  }

  private gameOver(reason: string): void {
    playSoundEffect('crash');
    this.scene.start('GameOverScene', {
      score: this.score,
      picks: `${this.targetIndex} / ${this.level.dealerStops.length}`,
      accuracy: Math.max(0, 100 - this.damage),
      reason,
    });
  }

  private startMusicPlaylist(): void {
    this.stopMusicPlaylist();
    this.playCurrentMusic();
  }

  private playCurrentMusic(): void {
    const key = this.level.musicKeys[this.currentMusicIndex];
    this.currentMusic = this.sound.add(key, { volume: 0.54 });
    this.currentMusic.once('complete', () => {
      this.currentMusic?.destroy();
      this.currentMusicIndex = (this.currentMusicIndex + 1) % this.level.musicKeys.length;
      this.playCurrentMusic();
    });
    this.currentMusic.play();
  }

  private stopMusicPlaylist(): void {
    for (const key of this.level.musicKeys) {
      this.sound.stopByKey(key);
    }
    this.currentMusic?.destroy();
    this.currentMusic = undefined;
  }
}
