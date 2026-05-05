import Phaser from 'phaser';

export function drawHouseHassonLogoBadge(scene: Phaser.Scene): void {
  scene.add.rectangle(118, 62, 204, 72, 0x080b0f, 0.94).setStrokeStyle(3, 0xe1aa3a).setDepth(100);
  scene.add.rectangle(118, 62, 190, 58, 0x000000, 0).setStrokeStyle(1, 0xffdf61, 0.35).setDepth(101);
  scene.add.image(118, 62, 'house-hasson-logo').setDisplaySize(168, 54).setDepth(102);
}
