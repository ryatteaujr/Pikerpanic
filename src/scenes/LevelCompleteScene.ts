import Phaser from 'phaser';

interface LevelCompleteData {
  score: number;
  remainingSeconds: number;
  accuracy: number;
  lph: number;
  lives: number;
  grade: string;
}

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelCompleteScene');
  }

  create(data: LevelCompleteData): void {
    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    this.add.rectangle(480, 320, 960, 640, 0x10251b);
    this.add
      .text(480, 128, 'LEVEL COMPLETE', {
        color: '#8dffb1',
        fontFamily: 'Arial Black, Arial',
        fontSize: '54px',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(
        480,
        300,
        `Score: ${data.score}\nTime Remaining: ${data.remainingSeconds}s\nAccuracy: ${data.accuracy}%\nLPH: ${data.lph}\nLives Remaining: ${data.lives}\nGrade: ${data.grade}`,
        {
          align: 'center',
          color: '#f6f0cf',
          fontFamily: 'Arial',
          fontSize: '24px',
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(480, 514, 'PRESS SPACE / A TO PLAY AGAIN', {
        color: '#f0c44c',
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.gamepad?.once('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 0) {
        this.scene.start('GameScene');
      }
    });
  }
}
