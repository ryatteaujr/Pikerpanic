import Phaser from 'phaser';

export function registerSoundToggle(scene: Phaser.Scene): void {
  scene.input.keyboard?.off('keydown-M');
  scene.input.keyboard?.on('keydown-M', () => {
    scene.sound.mute = !scene.sound.mute;
  });
}
