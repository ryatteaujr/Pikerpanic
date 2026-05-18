import Phaser from 'phaser';

export class Chute extends Phaser.GameObjects.Container {
  private readonly glow: Phaser.GameObjects.Ellipse;
  private readonly sprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, chuteNumber = '06') {
    super(scene, x, y);
    scene.add.existing(this);

    this.glow = scene.add.ellipse(0, 8, 108, 92, 0xc77dff, 0.2).setVisible(false);
    this.sprite = scene.add.image(0, -1, 'chute-machine').setOrigin(0.5).setDisplaySize(92, 109);
    const label = scene.add
      .text(0, -55, 'CHUTE', {
        color: '#f3d7ff',
        fontFamily: 'Arial Black',
        fontSize: '12px',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    const number = scene.add
      .text(0, -40, chuteNumber, {
        color: '#d58aff',
        fontFamily: 'Arial Black',
        fontSize: '16px',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add([this.glow, this.sprite, label, number]);

    scene.physics.add.existing(this, true);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(78, 58);
    body.setOffset(-39, -29);
    this.setDepth(10);
  }

  setActionGlow(active: boolean): void {
    this.glow.setVisible(active);
    this.glow.setAlpha(active ? 0.22 + Math.sin(this.scene.time.now / 120) * 0.12 : 0);
    this.sprite.setTint(active ? 0xfff0ff : 0xffffff);
  }
}
