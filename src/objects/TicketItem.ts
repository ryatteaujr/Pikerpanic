import Phaser from 'phaser';
import type { TicketItemType } from '../config/levelConfig';

const colors: Record<TicketItemType, number> = {
  Hammers: 0xe84d5b,
  Tape: 0x74e36d,
  'Drill Bits': 0xb985ff,
  Fragile: 0x8dffb1,
  'Water Heater': 0x5cc8ff,
  'Freezer Pack': 0xaeefff,
};

const labels: Record<TicketItemType, string> = {
  Hammers: 'H',
  Tape: 'T',
  'Drill Bits': 'D',
  Fragile: 'F!',
  'Water Heater': 'WH',
  'Freezer Pack': 'ICE',
};

export class TicketItem extends Phaser.GameObjects.Container {
  readonly itemType: TicketItemType;
  readonly label: Phaser.GameObjects.Text;
  private readonly glow: Phaser.GameObjects.Ellipse;
  private readonly tile: Phaser.GameObjects.Rectangle;
  private readonly labelBack: Phaser.GameObjects.Rectangle;
  picked = false;

  constructor(scene: Phaser.Scene, x: number, y: number, itemType: TicketItemType) {
    super(scene, x, y);
    this.itemType = itemType;
    scene.add.existing(this);

    this.glow = scene.add.ellipse(0, 0, 42, 42, colors[itemType], 0.22).setVisible(false);
    const shadow = scene.add.rectangle(2, 3, 28, 24, 0x06080a, 0.45);
    this.tile = scene.add.rectangle(0, 0, 24, 22, colors[itemType]).setStrokeStyle(2, 0xffffff);
    const inner = scene.add.rectangle(0, 0, 14, 12, 0x101820, 0.38).setStrokeStyle(1, 0xf7ffe9, 0.65);
    const shine = scene.add.rectangle(-5, -7, 10, 2, 0xffffff, 0.72);
    this.add([this.glow, shadow, this.tile, inner, shine]);

    scene.physics.add.existing(this, true);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(24, 22);
    body.setOffset(-12, -11);
    this.setDepth(12);

    this.labelBack = scene.add.rectangle(x, y + 24, labels[itemType].length > 2 ? 25 : 18, 14, 0x132026, 0.86).setStrokeStyle(1, colors[itemType]);
    this.label = scene.add
      .text(x, y + 24, itemType[0], {
        color: '#f6f0cf',
        fontFamily: 'Arial Black',
        fontSize: labels[itemType].length > 1 ? '8px' : '10px',
      })
      .setOrigin(0.5);
    this.label.setText(labels[itemType]);
    this.labelBack.setDepth(11);
    this.label.setDepth(12);
  }

  setActionGlow(active: boolean): void {
    if (this.picked) {
      return;
    }

    this.glow.setVisible(active);
    this.glow.setAlpha(active ? 0.18 + Math.sin(this.scene.time.now / 110) * 0.1 : 0);
    this.tile.setStrokeStyle(2, active ? 0xfff08a : 0xffffff);
  }

  markPicked(): void {
    this.picked = true;
    this.setVisible(false);
    this.labelBack.setVisible(false);
    this.label.setVisible(false);
    (this.body as Phaser.Physics.Arcade.StaticBody).enable = false;
  }
}
