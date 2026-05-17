import type Phaser from 'phaser';
import { GamepadManager } from './GamepadManager';

export function isPrimaryActionButton(buttonIndex: number): boolean {
  return buttonIndex === 0;
}

export function registerStartAction(scene: Phaser.Scene, start: () => void): void {
  const gamepad = new GamepadManager();
  let didStart = false;
  let pollEvent: Phaser.Time.TimerEvent | undefined;

  const startOnce = () => {
    if (didStart) {
      return;
    }

    didStart = true;
    pollEvent?.remove(false);
    start();
  };

  scene.input.keyboard?.once('keydown-SPACE', startOnce);
  scene.input.gamepad?.once('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
    if (isPrimaryActionButton(button.index)) {
      startOnce();
    }
  });

  gamepad.snapshot();
  pollEvent = scene.time.addEvent({
    delay: 16,
    loop: true,
    callback: () => {
      if (gamepad.snapshot().pickPressed) {
        startOnce();
      }
    },
  });

  scene.events.once('shutdown', () => pollEvent?.remove(false));
}
