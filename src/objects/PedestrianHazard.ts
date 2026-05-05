import Phaser from 'phaser';
import { createWorkerSprite, updateWorkerWalkAnimation } from './WorkerSprite';

export class PedestrianHazard extends Phaser.GameObjects.Container {
  private readonly workerSprite: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly area: Phaser.Geom.Rectangle,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const zone = scene.add.rectangle(area.centerX, area.centerY, area.width, area.height, 0x68f39a, 0.06)
      .setStrokeStyle(1, 0x68f39a, 0.2)
      .setDepth(1);
    const shadow = scene.add.ellipse(0, 10, 18, 6, 0x000000, 0.35);
    this.workerSprite = createWorkerSprite(scene, 24, 0.3);
    this.add([shadow, this.workerSprite]);
    zone.setName('pedestrian-designated-area');

    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 28);
    body.setOffset(-10, -24);
    body.setVelocity(34, 0);
    body.setBounce(1, 1);
    body.setCollideWorldBounds(false);
    this.setDepth(22);
  }

  updatePatrol(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.x <= this.area.left || this.x >= this.area.right) {
      body.setVelocityX(-body.velocity.x);
    }
    if (this.y <= this.area.top || this.y >= this.area.bottom) {
      body.setVelocityY(-body.velocity.y);
    }
    updateWorkerWalkAnimation(this.workerSprite, body.velocity.x);
  }
}
