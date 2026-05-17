import Phaser from 'phaser';
import { startConfig } from '../config/startConfig';
import { registerStartAction } from '../systems/StartAction';
import { registerSoundToggle } from '../systems/SoundToggle';
import { drawHouseHassonLogoBadge } from '../ui/BrandBadge';

interface GameOverData {
  score: number;
  picks: string;
  accuracy: number;
  reason: string;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: GameOverData): void {
    registerSoundToggle(this);
    document.querySelector<HTMLDivElement>('#hud-root')!.innerHTML = '';
    this.add.rectangle(480, 320, 960, 640, 0x210f16);
    drawHouseHassonLogoBadge(this);
    this.add
      .text(480, 150, 'GAME OVER', {
        color: '#ff6b6b',
        fontFamily: 'Arial Black, Arial',
        fontSize: '60px',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(480, 292, `${data.reason}\nScore: ${data.score}\nPicks Completed: ${data.picks}\nAccuracy: ${data.accuracy}%`, {
        align: 'center',
        color: '#f6f0cf',
        fontFamily: 'Arial',
        fontSize: '24px',
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    this.add
      .text(480, 468, 'PRESS SPACE / A TO RESTART', {
        color: '#8dffb1',
        fontFamily: 'Arial Black, Arial',
        fontSize: '26px',
      })
      .setOrigin(0.5);

    registerStartAction(this, () => this.scene.start(startConfig.scene, { level: startConfig.level }));
  }
}
