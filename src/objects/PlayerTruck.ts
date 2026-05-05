import Phaser from 'phaser';
import { pickTruckConfig } from '../config/vehicleConfig';

export class PlayerTruck extends Phaser.GameObjects.Container {
  private readonly driverSprite: Phaser.GameObjects.Sprite;
  private readonly topSprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.createDriverAnimations(scene);
    this.driverSprite = scene.add
      .sprite(0, 21, 'forklift-driver', 0)
      .setOrigin(0.5, 1)
      .setScale(0.18)
      .play('forklift-driver-idle');
    this.topSprite = scene.add.sprite(0, 0, 'player-forklift-top', 1).setScale(0.72).setVisible(false);

    this.add([this.topSprite, this.driverSprite]);

    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(28, 22);
    body.setOffset(-14, -11);
    this.setDepth(20);
  }

  private createDriverAnimations(scene: Phaser.Scene): void {
    if (scene.anims.exists('forklift-driver-idle')) {
      return;
    }

    scene.anims.create({
      key: 'forklift-driver-idle',
      frames: scene.anims.generateFrameNumbers('forklift-driver', { frames: [0, 1, 2, 3] }),
      frameRate: 3,
      repeat: -1,
    });
    scene.anims.create({
      key: 'forklift-driver-right',
      frames: scene.anims.generateFrameNumbers('forklift-driver', { frames: [4, 5, 6, 7] }),
      frameRate: 8,
      repeat: -1,
    });
    scene.anims.create({
      key: 'forklift-driver-left',
      frames: scene.anims.generateFrameNumbers('forklift-driver', { frames: [8, 9, 10, 11] }),
      frameRate: 8,
      repeat: -1,
    });
  }

  move(vector: Phaser.Math.Vector2): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (vector.lengthSq() === 0) {
      body.setVelocity(0, 0);
      if (this.driverSprite.visible) {
        this.driverSprite.play('forklift-driver-idle', true);
      }
      return;
    }

    const normalized = vector.normalize();
    body.setVelocity(normalized.x * pickTruckConfig.speed, normalized.y * pickTruckConfig.speed);
    this.setTruckFacing(normalized);
  }

  private setTruckFacing(normalized: Phaser.Math.Vector2): void {
    if (Math.abs(normalized.x) >= Math.abs(normalized.y)) {
      this.rotation = 0;
      this.topSprite.setVisible(false);
      this.driverSprite.setVisible(true);
      this.driverSprite.play(normalized.x >= 0 ? 'forklift-driver-right' : 'forklift-driver-left', true);
      return;
    }

    this.driverSprite.setVisible(false);
    this.topSprite.setVisible(true);
    this.topSprite.setFrame(normalized.y >= 0 ? 1 : 0);
    this.rotation = 0;
  }

  stop(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }
}
