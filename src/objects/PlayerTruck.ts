import Phaser from 'phaser';
import { pickTruckConfig } from '../config/vehicleConfig';

export class PlayerTruck extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const shadow = scene.add.rectangle(0, 3, 34, 24, 0x071116, 0.45);
    const chassis = scene.add.rectangle(-1, 0, 28, 18, 0x28aee8).setStrokeStyle(2, 0xe9f7ff);
    const cab = scene.add.rectangle(-8, 0, 12, 16, 0x6be6ff).setStrokeStyle(1, 0x0d5266);
    const windshield = scene.add.rectangle(-11, -4, 5, 5, 0xd7fbff, 0.9);
    const loadBed = scene.add.rectangle(9, 0, 13, 14, 0xf4c75b).setStrokeStyle(1, 0x6d4615);
    const mast = scene.add.rectangle(17, 0, 3, 18, 0x34434a);
    const forkTop = scene.add.rectangle(24, -5, 14, 3, 0xd8dde0);
    const forkBottom = scene.add.rectangle(24, 5, 14, 3, 0xd8dde0);
    const wheelA = scene.add.rectangle(-6, -12, 7, 4, 0x111820);
    const wheelB = scene.add.rectangle(-6, 12, 7, 4, 0x111820);
    const wheelC = scene.add.rectangle(9, -12, 7, 4, 0x111820);
    const wheelD = scene.add.rectangle(9, 12, 7, 4, 0x111820);
    const highlight = scene.add.rectangle(0, -7, 18, 2, 0xf6fdff, 0.7);
    this.add([shadow, forkTop, forkBottom, mast, wheelA, wheelB, wheelC, wheelD, chassis, cab, loadBed, windshield, highlight]);

    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(28, 22);
    body.setOffset(-14, -11);
    this.setDepth(20);
  }

  move(vector: Phaser.Math.Vector2): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (vector.lengthSq() === 0) {
      body.setVelocity(0, 0);
      return;
    }

    const normalized = vector.normalize();
    body.setVelocity(normalized.x * pickTruckConfig.speed, normalized.y * pickTruckConfig.speed);
    this.rotation = Math.atan2(normalized.y, normalized.x);
  }

  stop(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }
}
