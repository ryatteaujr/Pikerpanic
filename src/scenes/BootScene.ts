import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.spritesheet('player-picker', 'sprites/player-picker.png', { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet('forklift-driver', 'sprites/forklift-driver.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('bad-forklift-driver', 'sprites/bad-forklift-driver.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('player-forklift-top', 'sprites/player-forklift-top.png', { frameWidth: 64, frameHeight: 80 });
    this.load.spritesheet('bad-forklift-top', 'sprites/bad-forklift-top.png', { frameWidth: 64, frameHeight: 80 });
    this.load.spritesheet('worker', 'sprites/worker.png', { frameWidth: 128, frameHeight: 192 });
    this.load.spritesheet('cart-worker', 'sprites/cart-worker.png', { frameWidth: 320, frameHeight: 288 });
    this.load.spritesheet('dock-worker', 'sprites/dock-worker.png', { frameWidth: 160, frameHeight: 288 });
    this.load.spritesheet('big-bad-guy', 'sprites/big-bad-guy.png', { frameWidth: 192, frameHeight: 208 });
    this.load.svg('chute-machine', 'sprites/chute-machine.svg', { width: 92, height: 109 });
    this.load.svg('dock-target', 'sprites/dock-target.svg', { width: 108, height: 64 });
    this.load.image('house-hasson-logo', 'brand/house-hasson-logo.png');
    this.load.image('character-lineup', 'art/character-lineup.png');
    this.load.image('winner-credits', 'art/winner-credits.png');
    this.load.image('hardware-main-street', 'art/hardware-main-street.png');
    this.load.image('hardware-valley-supply', 'art/hardware-valley-supply.png');
    this.load.image('hardware-miller', 'art/hardware-miller.png');
    this.load.image('vehicle-hh-box-truck', 'sprites/vehicle-hh-box-truck.png');
    this.load.image('vehicle-purple-pickup', 'sprites/vehicle-purple-pickup.png');
    this.load.image('vehicle-blue-van', 'sprites/vehicle-blue-van.png');
    this.load.image('vehicle-yellow-truck', 'sprites/vehicle-yellow-truck.png');
    this.load.image('vehicle-red-truck', 'sprites/vehicle-red-truck.png');
    this.load.audio('music-expedite-load', 'audio/Expedite_The_Load.mp3');
    this.load.audio('music-schedule-failure', 'audio/Schedule_Failure_Imminent.mp3');
    this.load.audio('music-priority-override', 'audio/Priority_Override.mp3');
    this.load.audio('music-warehouse-gridlock', 'audio/Warehouse_Gridlock.mp3');
    this.load.audio('music-loading-bay-breach', 'audio/Loading_Bay_Breach.mp3');
    this.load.audio('music-final-boss-sprint', 'audio/Final_Boss_Sprint.mp3');
    this.load.audio('music-steel-beam-ascent', 'audio/Steel_Beam_Ascent.mp3');
    this.load.audio('music-watch-your-step', 'audio/Watch_Your_Step.mp3');
    this.load.audio('music-top-score-hazard', 'audio/Top_Score_Hazard.mp3');
    this.load.audio('music-the-loading-dock', 'audio/The_Loading_Dock.mp3');
    this.load.audio('music-loading-bay-protocol', 'audio/Loading_Bay_Protocol.mp3');
    this.load.audio('music-final-gate-opening', 'audio/Final_Gate_Opening.mp3');
  }

  create(): void {
    this.scene.start('StartScene');
  }
}
