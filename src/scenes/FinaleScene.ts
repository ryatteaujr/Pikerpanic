import Phaser from 'phaser';
import { getFinaleLevelConfig, type FinaleLevelConfig } from '../config/finaleConfig';
import { getNextLevelNumber } from '../config/levelConfig';
import { createCartWorkerSprite, updateCartWorkerAnimation } from '../objects/CartWorkerSprite';
import { createWorkerSprite, updateWorkerWalkAnimation } from '../objects/WorkerSprite';
import { playSoundEffect } from '../systems/SoundEffectManager';
import { registerSoundToggle } from '../systems/SoundToggle';
import { clampToDockBounds, getFinaleMovement, isNearDockTarget } from './finaleMovement';

interface MovingThing {
  sprite: Phaser.GameObjects.Container;
  visual?: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.Body;
  minX: number;
  maxX: number;
  speed: number;
}

interface WalkingWorker {
  sprite: Phaser.GameObjects.Container;
  visual: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.Body;
  left: number;
  right: number;
  speed: number;
}

interface MovingPackage {
  sprite: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;
  minX: number;
  maxX: number;
  vx: number;
  value: number;
}

const DOCK_BOUNDS = { left: 68, right: 860, top: 116, bottom: 570 };
const PLAYER_BODY = { width: 24, height: 42, offsetX: -12, offsetY: -28 };
const CARRY_LIMIT = 3;

export class FinaleScene extends Phaser.Scene {
  private level!: FinaleLevelConfig;
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private hazards: MovingThing[] = [];
  private workers: WalkingWorker[] = [];
  private packages: MovingPackage[] = [];
  private score = 0;
  private remainingSeconds = 90;
  private lives = 3;
  private carried = 0;
  private loaded = 0;
  private message = 'Grab dock freight and load the highlighted bays.';
  private hudContainer?: Phaser.GameObjects.Container;
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicIndex = 0;
  private lastHazardHitAt = -2000;

  constructor() {
    super('FinaleScene');
  }

  create(data: { level?: number } = {}): void {
    registerSoundToggle(this);
    const level = getFinaleLevelConfig(data.level ?? 7);
    if (!level) {
      this.scene.start('GameScene', { level: 1 });
      return;
    }

    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    this.level = level;
    this.score = 0;
    this.remainingSeconds = level.timerSeconds;
    this.lives = 3;
    this.carried = 0;
    this.loaded = 0;
    this.message = 'Grab dock freight and load the highlighted bays.';
    this.hazards = [];
    this.workers = [];
    this.packages = [];
    this.currentMusicIndex = 0;
    this.lastHazardHitAt = -2000;
    this.hudContainer?.destroy();
    this.hudContainer = undefined;

    this.physics.world.setBounds(DOCK_BOUNDS.left, DOCK_BOUNDS.top, DOCK_BOUNDS.right - DOCK_BOUNDS.left, DOCK_BOUNDS.bottom - DOCK_BOUNDS.top);
    this.drawDock();
    this.drawConveyors();
    this.drawDockTargets();
    this.createPlayer();
    this.createPackages();
    this.createHazards();
    this.createWorkers();
    this.drawHud();
    this.drawControlsGuide();

    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tickTimer() });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusicPlaylist());
    this.startMusicPlaylist();
  }

  update(): void {
    this.handleMovement();
    this.updatePackages();
    this.updateHazards();
    this.updateWorkers();
    this.checkDockLoad();
  }

  private createPlayer(): void {
    this.createDockWorkerAnimations();
    this.player = this.add.container(this.level.spawn.x, this.level.spawn.y).setDepth(40);
    this.playerSprite = this.add.sprite(0, 22, 'dock-worker', 0).setOrigin(0.5, 1).setScale(0.22).play('dock-worker-idle');
    this.player.add(this.playerSprite);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_BODY.width, PLAYER_BODY.height);
    body.setOffset(PLAYER_BODY.offsetX, PLAYER_BODY.offsetY);
    body.setCollideWorldBounds(true);
    body.setAllowGravity(false);

    this.input.keyboard?.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'W', 'A', 'S', 'D', 'E']);
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,SPACE,E') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  private createDockWorkerAnimations(): void {
    if (this.anims.exists('dock-worker-idle')) {
      return;
    }

    this.anims.create({
      key: 'dock-worker-idle',
      frames: this.anims.generateFrameNumbers('dock-worker', { frames: [0, 1] }),
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: 'dock-worker-walk-right',
      frames: this.anims.generateFrameNumbers('dock-worker', { frames: [2, 3, 4, 5] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'dock-worker-walk-left',
      frames: this.anims.generateFrameNumbers('dock-worker', { frames: [6, 7, 8, 9] }),
      frameRate: 8,
      repeat: -1,
    });
  }

  private handleMovement(): void {
    const movement = getFinaleMovement({
      left: Boolean(this.cursors?.left.isDown || this.keys.A?.isDown),
      right: Boolean(this.cursors?.right.isDown || this.keys.D?.isDown),
      up: Boolean(this.cursors?.up.isDown || this.keys.W?.isDown),
      down: Boolean(this.cursors?.down.isDown || this.keys.S?.isDown),
    });

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(movement.velocityX + this.getConveyorPush(), movement.velocityY);
    const clamped = clampToDockBounds({ x: this.player.x, y: this.player.y }, DOCK_BOUNDS);
    this.player.setPosition(clamped.x, clamped.y);
    this.updatePlayerAnimation(movement.velocityX, movement.velocityY);
  }

  private updatePlayerAnimation(velocityX: number, velocityY: number): void {
    if (velocityX > 1) {
      this.playerSprite.play('dock-worker-walk-right', true);
      return;
    }

    if (velocityX < -1) {
      this.playerSprite.play('dock-worker-walk-left', true);
      return;
    }

    if (Math.abs(velocityY) > 1) {
      this.playerSprite.play('dock-worker-walk-right', true);
      return;
    }

    this.playerSprite.play('dock-worker-idle', true);
  }

  private getConveyorPush(): number {
    const belt = this.level.conveyors.find((conveyor) => Math.abs(this.player.y - conveyor.y) < 26);
    return belt ? belt.direction * belt.speed : 0;
  }

  private drawDock(): void {
    this.add.rectangle(480, 320, 960, 640, 0x111820);
    this.add.rectangle(464, 348, 820, 478, 0x1f282b, 0.96).setStrokeStyle(3, 0x36515d);

    for (let x = 90; x <= 842; x += 64) {
      this.add.rectangle(x, 348, 4, 456, 0x33434c, 0.34).setDepth(1);
    }
    for (let y = 128; y <= 560; y += 56) {
      this.add.rectangle(464, y, 792, 3, 0x344149, 0.32).setDepth(1);
    }

    this.drawSignBox(148, 72, 190, 58, `HOUSE-HASSON\nHARDWARE\nDOCK ${this.level.level}`, 0xffdf61, '11px');
    this.drawSignBox(486, 72, 260, 58, this.level.name.toUpperCase(), 0x68f39a);
    this.drawSignBox(812, 72, 150, 58, 'TRUCK\nDEPARTURE', 0xff4e57);
    this.add.rectangle(108, 590, 116, 28, 0x071019, 0.95).setStrokeStyle(2, 0x86d8ff);
    this.add.text(108, 590, 'SAFE START', {
      color: '#86d8ff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      fixedWidth: 104,
      align: 'center',
    }).setOrigin(0.5);
  }

  private drawConveyors(): void {
    for (const conveyor of this.level.conveyors) {
      this.add.rectangle(conveyor.x, conveyor.y, conveyor.width, 42, 0x151c22).setStrokeStyle(3, 0xf0c44c).setDepth(4);
      this.add.rectangle(conveyor.x, conveyor.y, conveyor.width - 14, 24, 0x263542).setDepth(5);
      for (let x = conveyor.x - conveyor.width / 2 + 24; x < conveyor.x + conveyor.width / 2 - 12; x += 54) {
        const arrow = this.add.container(x, conveyor.y).setDepth(6);
        arrow.setRotation(conveyor.direction === 1 ? 0 : Math.PI);
        arrow.add([
          this.add.rectangle(0, 0, 24, 5, 0xffdf61, 0.7),
          this.add.triangle(16, 0, -5, -9, -5, 9, 12, 0, 0xffdf61, 0.7),
        ]);
      }
      this.drawSignBox(conveyor.x - conveyor.width / 2 + 48, conveyor.y - 35, 84, 28, conveyor.label, 0xf7efd0, '11px');
    }
  }

  private drawDockTargets(): void {
    for (const target of this.level.dockTargets) {
      this.add.rectangle(target.x, target.y, 108, 64, 0x173323).setStrokeStyle(4, 0x68f39a).setDepth(12);
      this.add.rectangle(target.x + 46, target.y, 8, 58, 0x68f39a, 0.8).setDepth(13);
      this.add.text(target.x - 8, target.y, target.label, {
        color: '#d7ffe5',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: '13px',
        align: 'center',
        fixedWidth: 82,
      }).setOrigin(0.5).setStroke('#000000', 3).setDepth(14);
    }
  }

  private drawControlsGuide(): void {
    const x = 146;
    const y = 154;
    this.add.rectangle(x, y, 168, 92, 0x071019, 0.92).setStrokeStyle(2, 0x68f39a, 0.85).setDepth(80);
    this.add.text(x, y - 32, 'KEYBOARD', {
      color: '#68f39a',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '13px',
      align: 'center',
      fixedWidth: 148,
    }).setOrigin(0.5).setDepth(81);
    this.add.text(x, y + 10, 'MOVE  ARROWS / WASD\nLOAD  E / SPACE\nAVOID TRAFFIC', {
      color: '#f7efd0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '12px',
      align: 'left',
      fixedWidth: 140,
      lineSpacing: 7,
    }).setOrigin(0.5).setDepth(81);
  }

  private createPackages(): void {
    for (const freight of this.level.packages) {
      const belt = this.level.conveyors.find((conveyor) => Math.abs(conveyor.y - freight.y) < conveyor.height / 2 + 4);
      const box = this.add.container(freight.x, freight.y).setDepth(24);
      box.add([
        this.add.rectangle(0, 0, 34, 26, 0xd87922).setStrokeStyle(2, 0x6e3811),
        this.add.rectangle(0, -7, 26, 4, 0xffb15a, 0.78),
        this.add.text(0, 3, freight.label, {
          color: '#fff4bf',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fontSize: '9px',
          fixedWidth: 30,
          align: 'center',
        }).setOrigin(0.5),
      ]);
      this.physics.add.existing(box);
      const body = box.body as Phaser.Physics.Arcade.Body;
      body.setSize(34, 26);
      body.setOffset(-17, -13);
      body.setAllowGravity(false);
      body.setVelocityX(belt ? belt.direction * belt.speed : 0);
      this.physics.add.overlap(this.player, box, () => this.collectPackage(box, freight.value));
      this.packages.push({
        sprite: box,
        body,
        minX: belt ? belt.x - belt.width / 2 + 34 : freight.x,
        maxX: belt ? belt.x + belt.width / 2 - 34 : freight.x,
        vx: belt ? belt.direction * belt.speed : 0,
        value: freight.value,
      });
    }
  }

  private collectPackage(box: Phaser.GameObjects.Container, value: number): void {
    if (this.carried >= CARRY_LIMIT) {
      this.message = 'Carry limit reached - load a dock bay.';
      this.drawHud();
      return;
    }

    box.destroy();
    this.carried += 1;
    this.score += value;
    this.message = `Freight secured. Carrying ${this.carried} / ${CARRY_LIMIT}.`;
    playSoundEffect('pickup');
    this.drawHud();
  }

  private updatePackages(): void {
    for (const freight of this.packages) {
      if (!freight.sprite.active || freight.vx === 0) {
        continue;
      }

      if (freight.sprite.x <= freight.minX && freight.body.velocity.x < 0) {
        freight.sprite.setX(freight.maxX);
      } else if (freight.sprite.x >= freight.maxX && freight.body.velocity.x > 0) {
        freight.sprite.setX(freight.minX);
      }
      freight.body.setVelocityX(freight.vx);
    }
  }

  private createHazards(): void {
    for (const hazard of this.level.hazards) {
      const sprite = this.add.container(hazard.x, hazard.y).setDepth(30);
      const isCartHazard = hazard.label !== 'FORK';
      const visual = isCartHazard ? createCartWorkerSprite(this, 42, 0.31) : undefined;
      if (visual) {
        sprite.add(visual);
      } else {
        sprite.add([
          this.add.rectangle(0, 0, 58, 28, 0x9b5b28).setStrokeStyle(2, 0xffb15a),
          this.add.rectangle(-18, 16, 12, 8, 0x071019).setStrokeStyle(1, 0xf7efd0),
          this.add.rectangle(18, 16, 12, 8, 0x071019).setStrokeStyle(1, 0xf7efd0),
          this.add.text(0, -1, hazard.label, {
            color: '#fff4bf',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '9px',
            fixedWidth: 50,
            align: 'center',
          }).setOrigin(0.5),
        ]);
      }
      this.physics.add.existing(sprite);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      if (visual) {
        body.setSize(76, 34);
        body.setOffset(-38, -17);
      } else {
        body.setSize(56, 28);
        body.setOffset(-28, -14);
      }
      body.setVelocityX(hazard.vx);
      body.setAllowGravity(false);
      this.physics.add.overlap(this.player, sprite, () => this.hitMovingFreight());
      this.hazards.push({ sprite, visual, body, minX: hazard.minX, maxX: hazard.maxX, speed: Math.abs(hazard.vx) });
    }
  }

  private createWorkers(): void {
    for (const worker of this.level.workers) {
      this.add.rectangle((worker.left + worker.right) / 2, worker.y, worker.right - worker.left + 26, 34, 0x68f39a, 0.05)
        .setStrokeStyle(1, 0x68f39a, 0.16)
        .setDepth(3);
      const sprite = this.add.container(worker.x, worker.y).setDepth(32);
      const shadow = this.add.ellipse(0, 12, 18, 6, 0x000000, 0.35);
      const visual = createWorkerSprite(this, 26, 0.31);
      sprite.add([shadow, visual]);
      this.physics.add.existing(sprite);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setSize(22, 40);
      body.setOffset(-11, -34);
      body.setVelocityX(worker.speed);
      body.setAllowGravity(false);
      body.setImmovable(true);
      this.physics.add.collider(this.player, sprite);
      this.workers.push({ sprite, visual, body, left: worker.left, right: worker.right, speed: Math.abs(worker.speed) });
    }
  }

  private updateHazards(): void {
    for (const hazard of this.hazards) {
      if (hazard.sprite.x <= hazard.minX) {
        hazard.sprite.setX(hazard.minX);
        hazard.body.setVelocityX(hazard.speed);
      } else if (hazard.sprite.x >= hazard.maxX) {
        hazard.sprite.setX(hazard.maxX);
        hazard.body.setVelocityX(-hazard.speed);
      } else if (Math.abs(hazard.body.velocity.x) < 1) {
        hazard.body.setVelocityX(hazard.speed);
      }
      if (hazard.visual) {
        updateCartWorkerAnimation(hazard.visual, hazard.body.velocity.x);
      }
    }
  }

  private updateWorkers(): void {
    for (const worker of this.workers) {
      if (worker.sprite.x <= worker.left) {
        worker.sprite.setX(worker.left);
        worker.body.setVelocityX(worker.speed);
      } else if (worker.sprite.x >= worker.right) {
        worker.sprite.setX(worker.right);
        worker.body.setVelocityX(-worker.speed);
      } else if (Math.abs(worker.body.velocity.x) < 1) {
        worker.body.setVelocityX(worker.speed);
      }
      updateWorkerWalkAnimation(worker.visual, worker.body.velocity.x);
    }
  }

  private checkDockLoad(): void {
    const wantsLoad = Boolean(Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE));
    if (!wantsLoad) {
      return;
    }

    const target = this.level.dockTargets.find((dockTarget) => isNearDockTarget(this.player, dockTarget, 62));
    if (!target) {
      this.message = 'Stand by a green dock bay to load.';
      this.drawHud();
      return;
    }

    if (this.carried === 0) {
      this.message = 'No freight carried.';
      this.drawHud();
      return;
    }

    const loadedNow = Math.min(this.carried, this.level.loadGoal - this.loaded);
    this.loaded += loadedNow;
    this.carried -= loadedNow;
    this.score += loadedNow * 250;
    this.message = `Loaded ${loadedNow} at ${target.label}.`;
    playSoundEffect('dropoff');
    this.drawHud();

    if (this.loaded >= this.level.loadGoal) {
      const nextLevel = getNextLevelNumber(this.level.level);
      this.scene.start('LevelCompleteScene', {
        level: this.level.level,
        nextLevel,
        score: this.score,
        remainingSeconds: this.remainingSeconds,
        accuracy: 100,
        lph: this.loaded,
        lives: this.lives,
        grade: this.remainingSeconds > 20 ? 'A: Dock Closer' : 'B: Last-Minute Load',
      });
    }
  }

  private tickTimer(): void {
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
    this.drawHud();
    if (this.remainingSeconds <= 0) {
      this.gameOver('The outbound truck left.');
    }
  }

  private drawHud(): void {
    this.hudContainer?.destroy();
    this.hudContainer = this.add.container(0, 0).setDepth(100);
    this.hudContainer.add(this.add.rectangle(480, 20, 960, 40, 0x05070a, 0.88));
    this.hudContainer.add(this.add.text(86, 6, `1UP\n${String(this.score).padStart(6, '0')}`, {
      color: '#ffdf61',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 104,
      lineSpacing: 1,
    }));
    this.hudContainer.add(this.add.text(324, 6, `LOAD\n${this.loaded}/${this.level.loadGoal}`, {
      color: '#68f39a',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 100,
      lineSpacing: 1,
    }));
    this.hudContainer.add(this.add.text(408, 6, `LEVEL\n${String(this.level.level).padStart(2, '0')}`, {
      color: '#ffdf61',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 76,
      lineSpacing: 1,
    }));
    this.hudContainer.add(this.add.text(480, 7, this.message, {
      color: '#f7efd0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '12px',
      align: 'center',
      fixedWidth: 270,
      wordWrap: { width: 270, useAdvancedWrap: true },
    }).setOrigin(0.5, 0));
    this.hudContainer.add(this.add.text(678, 6, `CARRY\n${this.carried}/${CARRY_LIMIT}`, {
      color: '#86d8ff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 88,
      lineSpacing: 1,
    }));
    this.hudContainer.add(this.add.text(772, 6, `LIVES\n${this.lives}`, {
      color: '#ff4e57',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 72,
      lineSpacing: 1,
    }));
    this.hudContainer.add(this.add.text(852, 6, `TIME\n${String(this.remainingSeconds).padStart(3, '0')}`, {
      color: '#ff4e57',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      align: 'center',
      fixedWidth: 88,
      lineSpacing: 1,
    }));

    const meterX = 484;
    const meterY = 47;
    const meterWidth = 230;
    const fillWidth = Math.max(0, Math.min(meterWidth, (this.loaded / this.level.loadGoal) * meterWidth));
    this.hudContainer.add(this.add.rectangle(meterX, meterY, meterWidth, 8, 0x24313a).setStrokeStyle(1, 0xf7efd0, 0.5));
    this.hudContainer.add(this.add.rectangle(meterX - meterWidth / 2 + fillWidth / 2, meterY, fillWidth, 8, 0x68f39a));
  }

  private drawSignBox(x: number, y: number, width: number, height: number, text: string, color: number, fontSize = '13px'): void {
    this.add.rectangle(x, y, width, height, 0x071019, 0.94).setStrokeStyle(2, color).setDepth(20);
    this.add.text(x, y, text, {
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize,
      align: 'center',
      fixedWidth: width - 12,
      fixedHeight: height - 8,
      wordWrap: { width: width - 12, useAdvancedWrap: true },
    }).setOrigin(0.5).setStroke('#000000', 3).setDepth(21);
  }

  private hitMovingFreight(): void {
    if (this.time.now - this.lastHazardHitAt < 1200) {
      return;
    }

    this.lastHazardHitAt = this.time.now;
    this.lives -= 1;
    this.remainingSeconds = Math.max(0, this.remainingSeconds - 5);
    this.message = 'Moving freight collision - life lost.';
    playSoundEffect('crash');
    this.cameras.main.shake(150, 0.008);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.player.setPosition(this.level.spawn.x, this.level.spawn.y);
    body.setVelocity(0, 0);
    this.drawHud();

    if (this.lives <= 0) {
      this.gameOver('Lives reached zero.');
    }
  }

  private gameOver(reason: string): void {
    playSoundEffect('crash');
    this.scene.start('GameOverScene', {
      score: this.score,
      picks: `${this.loaded} / ${this.level.loadGoal}`,
      accuracy: 100,
      reason,
    });
  }

  private startMusicPlaylist(): void {
    this.stopMusicPlaylist();
    this.playCurrentMusic();
  }

  private playCurrentMusic(): void {
    const key = this.level.musicKeys[this.currentMusicIndex];
    this.currentMusic = this.sound.add(key, { volume: 0.58 });
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
