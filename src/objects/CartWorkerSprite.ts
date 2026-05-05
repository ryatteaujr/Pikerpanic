import Phaser from 'phaser';

export function createCartWorkerAnimations(scene: Phaser.Scene): void {
  if (scene.anims.exists('cart-worker-idle')) {
    return;
  }

  scene.anims.create({
    key: 'cart-worker-idle',
    frames: scene.anims.generateFrameNumbers('cart-worker', { frames: [0, 1] }),
    frameRate: 2,
    repeat: -1,
  });
  scene.anims.create({
    key: 'cart-worker-right',
    frames: scene.anims.generateFrameNumbers('cart-worker', { frames: [2, 3, 4, 5] }),
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'cart-worker-left',
    frames: scene.anims.generateFrameNumbers('cart-worker', { frames: [6, 7, 8, 9] }),
    frameRate: 8,
    repeat: -1,
  });
}

export function createCartWorkerSprite(scene: Phaser.Scene, y: number, scale: number): Phaser.GameObjects.Sprite {
  createCartWorkerAnimations(scene);
  return scene.add.sprite(0, y, 'cart-worker', 0).setOrigin(0.5, 1).setScale(scale).play('cart-worker-idle');
}

export function updateCartWorkerAnimation(sprite: Phaser.GameObjects.Sprite, velocityX: number): void {
  if (velocityX > 1) {
    sprite.play('cart-worker-right', true);
    return;
  }

  if (velocityX < -1) {
    sprite.play('cart-worker-left', true);
    return;
  }

  sprite.play('cart-worker-idle', true);
}
