import Phaser from 'phaser';

export class ForkliftHazard extends Phaser.GameObjects.Container {
  private patrolIndex = 0;
  private facing: 'right' | 'down' | 'left' | 'up' = 'right';
  private readonly bodyLayer: Phaser.GameObjects.Container;
  private readonly forkLayer: Phaser.GameObjects.Container;
  private readonly driverSprite: Phaser.GameObjects.Sprite;
  private readonly topSprite: Phaser.GameObjects.Sprite;

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
    this.createDriverAnimations(scene);
    this.driverSprite = scene.add
      .sprite(0, 21, 'bad-forklift-driver', 0)
      .setOrigin(0.5, 1)
      .setScale(0.18);
    this.topSprite = scene.add.sprite(0, 0, 'bad-forklift-top', 1).setScale(0.72).setVisible(false);
    this.forkLayer = scene.add.container(0, 0);
    this.bodyLayer = scene.add.container(0, 0);
    this.add([this.forkLayer, this.bodyLayer, this.topSprite, this.driverSprite]);
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

  private createDriverAnimations(scene: Phaser.Scene): void {
    if (scene.anims.exists('bad-forklift-driver-idle')) {
      return;
    }

    scene.anims.create({
      key: 'bad-forklift-driver-idle',
      frames: scene.anims.generateFrameNumbers('bad-forklift-driver', { frames: [0, 1, 2, 3] }),
      frameRate: 3,
      repeat: -1,
    });
    scene.anims.create({
      key: 'bad-forklift-driver-right',
      frames: scene.anims.generateFrameNumbers('bad-forklift-driver', { frames: [4, 5, 6, 7] }),
      frameRate: 8,
      repeat: -1,
    });
    scene.anims.create({
      key: 'bad-forklift-driver-left',
      frames: scene.anims.generateFrameNumbers('bad-forklift-driver', { frames: [8, 9, 10, 11] }),
      frameRate: 8,
      repeat: -1,
    });
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
    this.topSprite.setVisible(false);
    this.driverSprite.setVisible(true);
    this.driverSprite.play(direction === 1 ? 'bad-forklift-driver-right' : 'bad-forklift-driver-left', true);
  }

  private drawVertical(direction: 1 | -1): void {
    this.driverSprite.setVisible(false);
    this.topSprite.setVisible(true);
    this.topSprite.setFrame(direction === 1 ? 1 : 0);
  }
}
