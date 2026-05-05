import Phaser from 'phaser';
import { registerSoundToggle } from '../systems/SoundToggle';

export class WinnerCreditsScene extends Phaser.Scene {
  constructor() {
    super('WinnerCreditsScene');
  }

  create(): void {
    registerSoundToggle(this);
    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    this.add.rectangle(480, 320, 960, 640, 0x070b10);
    this.add.image(480, 320, 'winner-credits').setDisplaySize(960, 540);
    this.add.rectangle(480, 610, 500, 38, 0x070b10, 0.78).setStrokeStyle(2, 0xf0c44c);
    this.add
      .text(480, 610, 'PRESS SPACE / A TO PLAY AGAIN', {
        color: '#8dffb1',
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const playAgain = () => this.scene.start('StartScene');
    this.input.keyboard?.once('keydown-SPACE', playAgain);
    this.input.gamepad?.once('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 0) {
        playAgain();
      }
    });
  }
}
