import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create(): void {
    this.add.rectangle(480, 320, 960, 640, 0x121923);
    this.add
      .text(480, 148, 'WAREHOUSE\nPICKER PANIC', {
        align: 'center',
        color: '#f0c44c',
        fontFamily: 'Arial Black, Arial',
        fontSize: '54px',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(480, 286, 'Complete the pick ticket before the truck leaves.', {
        color: '#f6f0cf',
        fontFamily: 'Arial',
        fontSize: '22px',
      })
      .setOrigin(0.5);

    this.add
      .text(480, 382, 'PRESS SPACE / A TO START', {
        color: '#8dffb1',
        fontFamily: 'Arial Black, Arial',
        fontSize: '28px',
      })
      .setOrigin(0.5);

    this.add
      .text(480, 462, 'Move: WASD or Arrows | Pick: Space | Unload: E or B | Pause: Esc', {
        color: '#d9e4ff',
        fontFamily: 'Arial',
        fontSize: '18px',
      })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard;
    keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.gamepad?.once('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 0) {
        this.scene.start('GameScene');
      }
    });
  }
}
