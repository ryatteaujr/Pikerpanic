import Phaser from 'phaser';
import { getInboundTrainingConfig, type InboundHazard, type InboundLevelConfig, type InboundReceivingBay } from '../config/inboundConfig';
import { createCartWorkerAnimations, updateCartWorkerAnimation } from '../objects/CartWorkerSprite';
import { PlayerTruck } from '../objects/PlayerTruck';
import { InputManager } from '../systems/InputManager';
import { playSoundEffect } from '../systems/SoundEffectManager';
import { registerSoundToggle } from '../systems/SoundToggle';
import { advanceInboundUnload, getInboundTrainingCompletion, isNearInboundPoint } from './inboundDelivery';

interface MovingInboundHazard {
  sprite: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;
  config: InboundHazard;
  visual?: Phaser.GameObjects.Sprite;
}

const RECEIVING_BAY_RADIUS = 74;
const TRUCK_DOOR_RADIUS = 64;
const DAMAGE_COOLDOWN_MS = 1100;

export class InboundTrainingScene extends Phaser.Scene {
  private level!: InboundLevelConfig;
  private inputManager!: InputManager;
  private player!: PlayerTruck;
  private hazards: MovingInboundHazard[] = [];
  private cargoLayer?: Phaser.GameObjects.Container;
  private carriedCargo?: Phaser.GameObjects.Rectangle;
  private hud?: Phaser.GameObjects.Container;
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicIndex = 0;
  private carrying = false;
  private remainingAtTruck = 0;
  private unloaded = 0;
  private message = 'Unload the inbound truck into receiving.';
  private lastHitAt = -DAMAGE_COOLDOWN_MS;
  private trainingComplete = false;

  constructor() {
    super('InboundTrainingScene');
  }

  create(): void {
    registerSoundToggle(this);
    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    this.level = getInboundTrainingConfig();
    this.carrying = false;
    this.remainingAtTruck = this.level.targetPallets;
    this.unloaded = 0;
    this.message = 'Pick freight from the inbound truck.';
    this.hazards = [];
    this.currentMusicIndex = 0;
    this.trainingComplete = false;

    this.inputManager = new InputManager(this);
    this.physics.world.setBounds(68, 116, 824, 460);
    this.drawWorld();
    this.createHazards();
    this.player = new PlayerTruck(this, this.level.spawn.x, this.level.spawn.y);
    this.physics.add.overlap(this.player, this.hazards.map((hazard) => hazard.sprite), () => this.hitHazard());
    this.drawCargo();
    this.drawHud();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusicPlaylist());
    this.startMusicPlaylist();
  }

  update(): void {
    if (this.inputManager.pausePressed()) {
      this.scene.start('StartScene');
      return;
    }

    if (this.trainingComplete) {
      return;
    }

    this.player.move(this.inputManager.movement());
    this.carriedCargo?.setPosition(this.player.x, this.player.y - 34);
    this.updateHazards();
    this.updateActionHints();

    if (this.inputManager.pickPressed()) {
      this.tryPickFromTruck();
    }

    if (this.inputManager.unloadPressed()) {
      this.tryUnloadToReceiving();
    }

    this.drawHud();
  }

  private drawWorld(): void {
    this.add.rectangle(480, 320, 960, 640, 0x111923);
    this.add.rectangle(480, 350, 860, 466, 0x1f2a31, 0.94).setStrokeStyle(4, 0x36515d);
    this.add.rectangle(480, 94, 960, 6, 0xf0c44c);

    for (let x = 110; x < 875; x += 58) {
      this.add.line(0, 0, x, 124, x, 572, 0x344149, 0.32).setOrigin(0);
    }
    for (let y = 140; y < 560; y += 56) {
      this.add.line(0, 0, 78, y, 882, y, 0x344149, 0.32).setOrigin(0);
    }

    this.drawInboundTruck();
    this.drawReceivingBays();
    this.drawControlsGuide();

    this.add.text(148, 36, 'HOUSE-HASSON HARDWARE', {
      color: '#f0c44c',
      fontFamily: 'Arial Black, Arial',
      fontSize: '17px',
    }).setOrigin(0.5);
    this.add.text(480, 24, 'TRAINING', {
      color: '#f0c44c',
      fontFamily: 'Arial Black, Arial',
      fontSize: '19px',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.text(480, 52, 'INBOUND DELIVERY', {
      color: '#8dffb1',
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(790, 36, 'RECEIVING DOCK', {
      color: '#6fd2ff',
      fontFamily: 'Arial Black, Arial',
      fontSize: '17px',
    }).setOrigin(0.5);
  }

  private drawInboundTruck(): void {
    const { x, y } = this.level.truckDoor;
    this.add.rectangle(76, y, 28, 328, 0x090d11).setStrokeStyle(3, 0x81909a).setDepth(4);
    this.add.rectangle(134, y, 96, 318, 0x101820).setStrokeStyle(4, 0xf0c44c).setDepth(4);
    this.add.rectangle(134, y - 4, 78, 284, 0x1a252d).setStrokeStyle(2, 0x6d7a83).setDepth(5);
    this.add.rectangle(134, y - 4, 58, 258, 0x101820, 0.88).setDepth(5);
    this.add.rectangle(88, y - 128, 12, 42, 0x29343c).setStrokeStyle(1, 0xa8b0b6).setDepth(6);
    this.add.rectangle(88, y + 52, 12, 42, 0x29343c).setStrokeStyle(1, 0xa8b0b6).setDepth(6);
    this.add.rectangle(180, y - 128, 12, 42, 0x29343c).setStrokeStyle(1, 0xa8b0b6).setDepth(6);
    this.add.rectangle(180, y + 52, 12, 42, 0x29343c).setStrokeStyle(1, 0xa8b0b6).setDepth(6);
    this.add.line(0, 0, 96, y - 142, 172, y - 142, 0xc8d0d4, 0.75).setLineWidth(2).setOrigin(0).setDepth(6);
    this.add.line(0, 0, 96, y + 108, 172, y + 108, 0xc8d0d4, 0.75).setLineWidth(2).setOrigin(0).setDepth(6);
    this.add.rectangle(132, y + 150, 104, 42, 0x27313a).setStrokeStyle(3, 0xd9e4ff).setDepth(5);
    this.add.rectangle(132, y + 173, 74, 16, 0x0b0f14).setStrokeStyle(2, 0xa8b0b6).setDepth(6);
    this.add.rectangle(104, y + 151, 12, 8, 0xffdf61).setDepth(7);
    this.add.rectangle(160, y + 151, 12, 8, 0xff5c4d).setDepth(7);
    this.add.rectangle(132, y + 198, 54, 54, 0x25303a).setStrokeStyle(3, 0x81909a).setDepth(4);
    this.add.rectangle(132, y + 200, 36, 26, 0x5fb6e8, 0.55).setStrokeStyle(2, 0xd9e4ff).setDepth(5);
    this.add.rectangle(112, y + 228, 18, 12, 0x071019).setStrokeStyle(1, 0xf7efd0).setDepth(5);
    this.add.rectangle(152, y + 228, 18, 12, 0x071019).setStrokeStyle(1, 0xf7efd0).setDepth(5);
    this.add.text(x, y - 134, 'INBOUND\nTRUCK', {
      align: 'center',
      color: '#f7efd0',
      fontFamily: 'Arial Black, Arial',
      fontSize: '14px',
    }).setOrigin(0.5).setDepth(6);
  }

  private drawReceivingBays(): void {
    for (const bay of this.level.receivingBays) {
      this.drawReceivingBay(bay);
    }
  }

  private drawReceivingBay(bay: InboundReceivingBay): void {
    this.add.rectangle(bay.x, bay.y, 164, 72, 0x173323).setStrokeStyle(4, bay.color).setDepth(6);
    this.add.rectangle(bay.x + 68, bay.y, 8, 64, bay.color, 0.82).setDepth(7);
    this.add.text(bay.x - 8, bay.y, bay.label, {
      align: 'center',
      color: '#eaffef',
      fontFamily: 'Arial Black, Arial',
      fontSize: '13px',
      fixedWidth: 128,
    }).setOrigin(0.5).setStroke('#000000', 3).setDepth(8);
  }

  private drawControlsGuide(): void {
    this.add.rectangle(298, 548, 352, 76, 0x071019, 0.9).setStrokeStyle(2, 0x68f39a);
    this.add.text(298, 548, 'MOVE  ARROWS / WASD / STICK\nPICK  SPACE / A   DROP  E / B\nEXIT TRAINING  ESC / START', {
      color: '#f7efd0',
      fontFamily: 'Arial Black, Arial',
      fontSize: '12px',
      fixedWidth: 330,
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    this.add.rectangle(820, 548, 150, 54, 0x071019, 0.92)
      .setStrokeStyle(2, 0xff7be8)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('StartScene'));
    this.add.text(820, 548, 'EXIT\nTRAINING', {
      align: 'center',
      color: '#ff7be8',
      fontFamily: 'Arial Black, Arial',
      fontSize: '13px',
      lineSpacing: 2,
    }).setOrigin(0.5);
  }

  private createHazards(): void {
    for (const config of this.level.hazards) {
      const sprite = this.add.container(config.x, config.y).setDepth(26);
      const visual = this.drawInboundHazard(sprite, config);
      this.physics.add.existing(sprite);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setSize(58, 28);
      body.setOffset(-29, -14);
      body.setAllowGravity(false);
      body.setVelocityX(config.speed);
      this.hazards.push({ sprite, body, config, visual });
    }
  }

  private drawInboundHazard(sprite: Phaser.GameObjects.Container, config: InboundHazard): Phaser.GameObjects.Sprite | undefined {
    sprite.add(this.add.ellipse(0, 15, 80, 20, 0x000000, 0.3));

    if (config.label === 'FORK') {
      sprite.add(this.add.ellipse(0, 6, 58, 42, 0xff1f21, 0.16));
      const forklift = this.add
        .sprite(0, 23, 'bad-forklift-driver', config.speed >= 0 ? 4 : 8)
        .setOrigin(0.5, 1)
        .setScale(0.2);
      sprite.add(forklift);
      return forklift;
    }

    createCartWorkerAnimations(this);
    const cartWorker = this.add
      .sprite(0, 29, 'cart-worker', config.speed >= 0 ? 2 : 6)
      .setOrigin(0.5, 1)
      .setScale(0.23)
      .play(config.speed >= 0 ? 'cart-worker-right' : 'cart-worker-left');
    sprite.add(cartWorker);
    return cartWorker;
  }

  private updateHazards(): void {
    for (const hazard of this.hazards) {
      if (hazard.sprite.x <= hazard.config.minX) {
        hazard.sprite.setX(hazard.config.minX);
        hazard.body.setVelocityX(Math.abs(hazard.config.speed));
      } else if (hazard.sprite.x >= hazard.config.maxX) {
        hazard.sprite.setX(hazard.config.maxX);
        hazard.body.setVelocityX(-Math.abs(hazard.config.speed));
      }

      if (hazard.visual) {
        if (hazard.config.label === 'FORK') {
          hazard.visual.setFrame(hazard.body.velocity.x >= 0 ? 4 : 8);
        } else {
          updateCartWorkerAnimation(hazard.visual, hazard.body.velocity.x);
        }
      }
    }
  }

  private tryPickFromTruck(): void {
    if (this.carrying) {
      this.message = 'Forks are full. Take that pallet to receiving.';
      return;
    }

    if (this.remainingAtTruck <= 0) {
      this.message = 'Truck is empty. Clear the receiving paperwork.';
      return;
    }

    if (!isNearInboundPoint(this.player, this.level.truckDoor, TRUCK_DOOR_RADIUS)) {
      this.message = 'Back into the inbound truck door to pick freight.';
      return;
    }

    this.carrying = true;
    this.remainingAtTruck -= 1;
    this.message = 'Pallet loaded. Drop it in a green receiving bay.';
    playSoundEffect('pickup');
    this.drawCargo();
  }

  private tryUnloadToReceiving(): void {
    const bay = this.level.receivingBays.find((candidate) => isNearInboundPoint(this.player, candidate, RECEIVING_BAY_RADIUS));
    if (!bay) {
      this.message = 'Line up at a receiving bay to drop freight.';
      return;
    }

    const result = advanceInboundUnload({ unloaded: this.unloaded, target: this.level.targetPallets, carrying: this.carrying });
    if (!this.carrying) {
      this.message = 'No pallet on the forks.';
      return;
    }

    this.carrying = result.carrying;
    this.unloaded = result.unloaded;
    this.message = `Dropped at ${bay.label}. ${this.unloaded}/${this.level.targetPallets} received.`;
    playSoundEffect('dropoff');
    this.cameras.main.flash(90, 104, 243, 154, false);
    this.drawCargo();

    if (result.completed) {
      this.completeTraining();
    }
  }

  private updateActionHints(): void {
    const nearTruck = isNearInboundPoint(this.player, this.level.truckDoor, TRUCK_DOOR_RADIUS);
    const nearBay = this.level.receivingBays.some((bay) => isNearInboundPoint(this.player, bay, RECEIVING_BAY_RADIUS));
    if (!this.carrying && nearTruck && this.remainingAtTruck > 0) {
      this.message = 'Press Space/A to pick inbound freight.';
    } else if (this.carrying && nearBay) {
      this.message = 'Press E/B to drop freight in receiving.';
    }
  }

  private drawCargo(): void {
    this.cargoLayer?.destroy();
    this.cargoLayer = this.add.container(0, 0).setDepth(18);
    this.carriedCargo = undefined;

    for (let i = 0; i < this.remainingAtTruck; i += 1) {
      const x = 104 + (i % 2) * 40;
      const y = 252 + Math.floor(i / 2) * 38;
      this.cargoLayer.add(this.add.rectangle(x, y, 30, 24, 0xd99032).setStrokeStyle(2, 0x6e3811));
      this.cargoLayer.add(this.add.rectangle(x, y - 7, 22, 4, 0xffdf61, 0.62));
    }

    for (let i = 0; i < this.unloaded; i += 1) {
      const x = 610 + (i % 3) * 36;
      const y = 528 - Math.floor(i / 3) * 32;
      this.cargoLayer.add(this.add.rectangle(x, y, 30, 24, 0x68a63f).setStrokeStyle(2, 0xd7ffe5));
    }

    if (this.carrying) {
      this.carriedCargo = this.add.rectangle(this.player.x, this.player.y - 34, 32, 24, 0xd99032).setStrokeStyle(2, 0xffdf61);
      this.cargoLayer.add(this.carriedCargo);
    }
  }

  private hitHazard(): void {
    if (this.time.now - this.lastHitAt < DAMAGE_COOLDOWN_MS) {
      return;
    }

    this.lastHitAt = this.time.now;
    this.carrying = false;
    this.message = 'Training bump. Pallet dropped - try again.';
    playSoundEffect('crash');
    this.cameras.main.shake(140, 0.007);
    this.player.setPosition(this.level.spawn.x, this.level.spawn.y);
    this.player.stop();
    this.drawCargo();
  }

  private completeTraining(): void {
    const completion = getInboundTrainingCompletion();
    this.trainingComplete = true;
    this.message = `${completion.message} - returning to start.`;
    this.drawHud();
    this.time.delayedCall(1100, () => this.scene.start(completion.scene));
  }

  private drawHud(): void {
    this.hud?.destroy();
    this.hud = this.add.container(0, 0).setDepth(80);
    const panelY = 126;
    const panels = [
      { x: 148, width: 180, title: 'MODE', value: 'TRAINING' },
      { x: 480, width: 250, title: 'RECEIVED', value: `${this.unloaded} / ${this.level.targetPallets}` },
      { x: 812, width: 180, title: 'GOAL', value: 'PRACTICE' },
    ];

    for (const panel of panels) {
      this.hud.add(this.add.rectangle(panel.x, panelY, panel.width, 48, 0x071019, 0.92).setStrokeStyle(2, 0x5fb6e8));
      this.hud.add(this.add.text(panel.x, panelY - 11, panel.title, {
        color: panel.title === 'TIME' ? '#ff5c7a' : '#f0c44c',
        fontFamily: 'Arial Black, Arial',
        fontSize: '12px',
      }).setOrigin(0.5));
      this.hud.add(this.add.text(panel.x, panelY + 12, panel.value, {
        color: '#f7efd0',
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
      }).setOrigin(0.5));
    }

    this.hud.add(this.add.rectangle(480, 612, 720, 34, 0x071019, 0.9).setStrokeStyle(2, 0xf0c44c));
    this.hud.add(this.add.text(480, 612, this.message, {
      color: '#d9e4ff',
      fontFamily: 'Arial',
      fontSize: '15px',
      fixedWidth: 690,
      align: 'center',
    }).setOrigin(0.5));
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
