import Phaser from 'phaser';

export class Pickup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const shadow = scene.add.rectangle(2, 3, 13, 9, 0x0b0b0b, 0.35);
    const carton = scene.add.rectangle(0, 0, 12, 10, 0xc88737).setStrokeStyle(1, 0x5a3513);
    const top = scene.add.rectangle(0, -4, 10, 2, 0xf2bd66, 0.95);
    const tape = scene.add.rectangle(0, 0, 2, 9, 0xf4d08a, 0.85);
    const bright = scene.add.rectangle(-3, -2, 3, 2, 0xffe0a6, 0.75);
    this.add([shadow, carton, top, tape, bright]);

    scene.physics.add.existing(this, true);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(12, 10);
    body.setOffset(-6, -5);
    this.setDepth(9);
  }
}
