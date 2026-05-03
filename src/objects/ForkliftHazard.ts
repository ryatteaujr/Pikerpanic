import Phaser from 'phaser';

export class ForkliftHazard extends Phaser.GameObjects.Container {
  private patrolIndex = 0;
  private facing: 'right' | 'down' | 'left' | 'up' = 'right';
  private readonly bodyLayer: Phaser.GameObjects.Container;
  private readonly forkLayer: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly patrolPoints: Phaser.Math.Vector2[],
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const glow = scene.add.ellipse(0, 0, 52, 38, 0xff1f21, 0.18).setName('glow');
    this.add(glow);
    this.forkLayer = scene.add.container(0, 0);
    this.bodyLayer = scene.add.container(0, 0);
    this.add([this.forkLayer, this.bodyLayer]);
    this.drawFacing('right');

    scene.tweens.add({
      targets: glow,
      alpha: 0.35,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 360,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setImmovable(true);
    body.setSize(34, 24);
    body.setOffset(-17, -12);
    this.setDepth(21);
  }

  updatePatrol(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const target = this.patrolPoints[this.patrolIndex];
    const toTarget = new Phaser.Math.Vector2(target.x - this.x, target.y - this.y);

    if (toTarget.length() < 8) {
      this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
      return;
    }

    const velocity = toTarget.normalize().scale(104);
    body.setVelocity(velocity.x, velocity.y);
    this.setFacingFromVelocity(velocity);
  }

  private setFacingFromVelocity(velocity: Phaser.Math.Vector2): void {
    const nextFacing =
      Math.abs(velocity.x) >= Math.abs(velocity.y)
        ? velocity.x >= 0
          ? 'right'
          : 'left'
        : velocity.y >= 0
          ? 'down'
          : 'up';

    if (nextFacing === this.facing) {
      return;
    }

    this.drawFacing(nextFacing);
  }

  private drawFacing(facing: 'right' | 'down' | 'left' | 'up'): void {
    this.facing = facing;
    this.rotation = 0;
    this.bodyLayer.removeAll(true);
    this.forkLayer.removeAll(true);

    if (facing === 'right') {
      this.drawHorizontal(1);
      return;
    }
    if (facing === 'left') {
      this.drawHorizontal(-1);
      return;
    }
    if (facing === 'down') {
      this.drawVertical(1);
      return;
    }
    this.drawVertical(-1);
  }

  private drawHorizontal(direction: 1 | -1): void {
    const scene = this.scene;
    const front = 1 * direction;
    const rear = -1 * direction;
    const shadow = scene.add.rectangle(0, 3, 36, 25, 0x120908, 0.45);
    const chassis = scene.add.rectangle(0, 0, 30, 21, 0x24302a).setStrokeStyle(2, 0x111812);
    const rearBlock = scene.add.rectangle(7 * rear, -1, 14, 15, 0x58c870).setStrokeStyle(1, 0x1d5f2d);
    const frontBlock = scene.add.rectangle(7 * front, -1, 12, 15, 0xffc84d).setStrokeStyle(1, 0x7a4f10);
    const mast = scene.add.rectangle(18 * front, 0, 4, 24, 0x2f3438);
    const forkTop = scene.add.rectangle(31 * front, -6, 22, 3, 0xe8edf0);
    const forkBottom = scene.add.rectangle(31 * front, 6, 22, 3, 0xe8edf0);
    const wheelA = scene.add.rectangle(-4, -13, 8, 4, 0x111111);
    const wheelB = scene.add.rectangle(-4, 13, 8, 4, 0x111111);
    const wheelC = scene.add.rectangle(10 * front, -13, 8, 4, 0x111111);
    const wheelD = scene.add.rectangle(10 * front, 13, 8, 4, 0x111111);
    const counterweight = scene.add.rectangle(17 * rear, 0, 5, 18, 0x2f8f45).setStrokeStyle(1, 0x174521);
    const warning = scene.add.rectangle(19 * rear, 0, 4, 12, 0xff3f3f, 0.9);
    this.forkLayer.add([forkTop, forkBottom]);
    this.bodyLayer.add([shadow, mast, wheelA, wheelB, wheelC, wheelD, chassis, rearBlock, frontBlock, counterweight, warning]);
  }

  private drawVertical(direction: 1 | -1): void {
    const scene = this.scene;
    const front = 1 * direction;
    const rear = -1 * direction;
    const shadow = scene.add.rectangle(0, 3, 25, 36, 0x120908, 0.45);
    const chassis = scene.add.rectangle(0, 0, 21, 30, 0x24302a).setStrokeStyle(2, 0x111812);
    const rearBlock = scene.add.rectangle(1, 7 * rear, 15, 14, 0x58c870).setStrokeStyle(1, 0x1d5f2d);
    const frontBlock = scene.add.rectangle(1, 7 * front, 15, 12, 0xffc84d).setStrokeStyle(1, 0x7a4f10);
    const mast = scene.add.rectangle(0, 18 * front, 24, 4, 0x2f3438);
    const forkLeft = scene.add.rectangle(-6, 31 * front, 3, 22, 0xe8edf0);
    const forkRight = scene.add.rectangle(6, 31 * front, 3, 22, 0xe8edf0);
    const wheelA = scene.add.rectangle(-13, -4, 4, 8, 0x111111);
    const wheelB = scene.add.rectangle(13, -4, 4, 8, 0x111111);
    const wheelC = scene.add.rectangle(-13, 10 * front, 4, 8, 0x111111);
    const wheelD = scene.add.rectangle(13, 10 * front, 4, 8, 0x111111);
    const counterweight = scene.add.rectangle(0, 17 * rear, 18, 5, 0x2f8f45).setStrokeStyle(1, 0x174521);
    const warning = scene.add.rectangle(0, 19 * rear, 12, 4, 0xff3f3f, 0.9);
    this.forkLayer.add([forkLeft, forkRight]);
    this.bodyLayer.add([shadow, mast, wheelA, wheelB, wheelC, wheelD, chassis, rearBlock, frontBlock, counterweight, warning]);
  }
}
