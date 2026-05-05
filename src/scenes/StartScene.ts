import Phaser from 'phaser';
import { registerSoundToggle } from '../systems/SoundToggle';
import { drawHouseHassonLogoBadge } from '../ui/BrandBadge';

const testingStartScene = 'GameScene';
const testingStartLevel = 1;

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create(): void {
    registerSoundToggle(this);
    this.add.rectangle(480, 320, 960, 640, 0x121923);
    this.add.image(480, 280, 'character-lineup').setDisplaySize(900, 514);
    this.add.rectangle(480, 280, 908, 522, 0x000000, 0).setStrokeStyle(4, 0xf0c44c);
    drawHouseHassonLogoBadge(this);

    this.add
      .text(480, 568, 'PRESS SPACE / A TO START', {
        color: '#8dffb1',
        fontFamily: 'Arial Black, Arial',
        fontSize: '26px',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(480, 610, 'Move: WASD or Arrows | Pick: Space | Unload: E or B | M: Sound', {
        color: '#d9e4ff',
        fontFamily: 'Arial',
        fontSize: '18px',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard;
    keyboard?.once('keydown-SPACE', () => this.scene.start(testingStartScene, { level: testingStartLevel }));
    this.input.gamepad?.once('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 0) {
        this.scene.start(testingStartScene, { level: testingStartLevel });
      }
    });
  }
}
