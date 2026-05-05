import Phaser from 'phaser';

export class Chute extends Phaser.GameObjects.Container {
  private readonly glow: Phaser.GameObjects.Ellipse;
  private readonly dock: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, chuteNumber = '06') {
    super(scene, x, y);
    scene.add.existing(this);

    this.glow = scene.add.ellipse(0, 0, 108, 82, 0xc77dff, 0.2).setVisible(false);
    const shadow = scene.add.rectangle(2, 5, 84, 62, 0x05050b, 0.45);
    this.dock = scene.add.rectangle(0, 0, 78, 58, 0x5c2aa6).setStrokeStyle(4, 0xd8b6ff);
    const well = scene.add.rectangle(0, 4, 54, 34, 0x271342).setStrokeStyle(2, 0x8d63d6);
    const railLeft = scene.add.rectangle(-43, 0, 5, 64, 0x24152f).setStrokeStyle(1, 0xf4d35e);
    const railRight = scene.add.rectangle(43, 0, 5, 64, 0x24152f).setStrokeStyle(1, 0xf4d35e);
    const bollardA = scene.add.circle(-52, 25, 5, 0xf4d35e).setStrokeStyle(1, 0x4a3200);
    const bollardB = scene.add.circle(52, 25, 5, 0xf4d35e).setStrokeStyle(1, 0x4a3200);
    const arrowStem = scene.add.rectangle(0, -8, 8, 22, 0xf4f0ff);
    const arrowHead = scene.add.triangle(0, 12, -12, -5, 12, -5, 0, 10, 0xf4f0ff);
    const labelPlate = scene.add.rectangle(0, -45, 64, 28, 0x1b1029).setStrokeStyle(2, 0xd8b6ff);
    const label = scene.add
      .text(0, -51, 'CHUTE', {
        color: '#f3d7ff',
        fontFamily: 'Arial Black',
        fontSize: '11px',
      })
      .setOrigin(0.5);
    const number = scene.add
      .text(0, -39, chuteNumber, {
        color: '#d58aff',
        fontFamily: 'Arial Black',
        fontSize: '13px',
      })
      .setOrigin(0.5);
    this.add([
      this.glow,
      shadow,
      this.dock,
      well,
      railLeft,
      railRight,
      bollardA,
      bollardB,
      arrowStem,
      arrowHead,
      labelPlate,
      label,
      number,
    ]);

    scene.physics.add.existing(this, true);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(78, 58);
    body.setOffset(-39, -29);
    this.setDepth(10);
  }

  setActionGlow(active: boolean): void {
    this.glow.setVisible(active);
    this.glow.setAlpha(active ? 0.22 + Math.sin(this.scene.time.now / 120) * 0.12 : 0);
    this.dock.setStrokeStyle(4, active ? 0xfff08a : 0xd8b6ff);
  }
}
