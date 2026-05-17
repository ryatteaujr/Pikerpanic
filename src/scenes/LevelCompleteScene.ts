import Phaser from 'phaser';
import { getSceneKeyForLevel } from '../config/startConfig';
import { registerStartAction } from '../systems/StartAction';
import { registerSoundToggle } from '../systems/SoundToggle';
import { drawHouseHassonLogoBadge } from '../ui/BrandBadge';

interface LevelCompleteData {
  level: number;
  nextLevel: number | null;
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
    registerSoundToggle(this);
    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    this.add.rectangle(480, 320, 960, 640, 0x10251b);
    drawHouseHassonLogoBadge(this);
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
        `Level ${data.level} cleared\nScore: ${data.score}\nTime Remaining: ${data.remainingSeconds}s\nAccuracy: ${data.accuracy}%\nLPH: ${data.lph}\nLives Remaining: ${data.lives}\nGrade: ${data.grade}`,
        {
          align: 'center',
          color: '#f6f0cf',
          fontFamily: 'Arial',
          fontSize: '24px',
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    const nextPrompt = data.nextLevel ? `PRESS SPACE / A FOR LEVEL ${data.nextLevel}` : 'PRESS SPACE / A TO PLAY AGAIN';
    this.add
      .text(480, 514, nextPrompt, {
        color: '#f0c44c',
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
      })
      .setOrigin(0.5);

    const startNextLevel = () => {
      const level = data.nextLevel ?? 1;
      this.scene.start(getSceneKeyForLevel(level), { level });
    };

    registerStartAction(this, startNextLevel);
  }
}
