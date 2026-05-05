import Phaser from 'phaser';
import { levelConfig } from './levelConfig';
import { BootScene } from '../scenes/BootScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { GameScene } from '../scenes/GameScene';
import { LevelCompleteScene } from '../scenes/LevelCompleteScene';
import { MezzanineScene } from '../scenes/MezzanineScene';
import { FinaleScene } from '../scenes/FinaleScene';
import { DealerDashScene } from '../scenes/DealerDashScene';
import { StartScene } from '../scenes/StartScene';
import { WinnerCreditsScene } from '../scenes/WinnerCreditsScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: levelConfig.width,
  height: levelConfig.height,
  backgroundColor: '#182028',
  pixelArt: true,
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [
    BootScene,
    StartScene,
    GameScene,
    MezzanineScene,
    FinaleScene,
    DealerDashScene,
    GameOverScene,
    LevelCompleteScene,
    WinnerCreditsScene,
  ],
};
