import Phaser from 'phaser';

export function createWorkerAnimations(scene: Phaser.Scene): void {
  if (scene.anims.exists('worker-idle')) {
    return;
  }

  scene.anims.create({
    key: 'worker-idle',
    frames: scene.anims.generateFrameNumbers('worker', { frames: [0, 1] }),
    frameRate: 2,
    repeat: -1,
  });
  scene.anims.create({
    key: 'worker-walk-right',
    frames: scene.anims.generateFrameNumbers('worker', { frames: [2, 3, 4, 5] }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'worker-walk-left',
    frames: scene.anims.generateFrameNumbers('worker', { frames: [6, 7, 8, 9] }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'worker-climb',
    frames: scene.anims.generateFrameNumbers('worker', { frames: [10, 11] }),
    frameRate: 5,
    repeat: -1,
  });
  scene.anims.create({
    key: 'worker-jump',
    frames: scene.anims.generateFrameNumbers('worker', { frames: [12, 13] }),
    frameRate: 5,
    repeat: -1,
  });
}

export function createWorkerSprite(scene: Phaser.Scene, y: number, scale: number): Phaser.GameObjects.Sprite {
  createWorkerAnimations(scene);
  return scene.add.sprite(0, y, 'worker', 0).setOrigin(0.5, 1).setScale(scale).play('worker-idle');
}

export function updateWorkerWalkAnimation(sprite: Phaser.GameObjects.Sprite, velocityX: number): void {
  if (velocityX > 1) {
    sprite.play('worker-walk-right', true);
    return;
  }

  if (velocityX < -1) {
    sprite.play('worker-walk-left', true);
    return;
  }

  sprite.play('worker-idle', true);
}
