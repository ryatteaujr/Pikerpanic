import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.audio('music-expedite-load', 'audio/Expedite_The_Load.mp3');
    this.load.audio('music-schedule-failure', 'audio/Schedule_Failure_Imminent.mp3');
    this.load.audio('music-priority-override', 'audio/Priority_Override.mp3');
  }

  create(): void {
    this.scene.start('StartScene');
  }
}
