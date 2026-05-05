import Phaser from 'phaser';
import { GamepadManager } from './GamepadManager';

export class InputManager {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly gamepad = new GamepadManager();
  private gamepadSnapshot = this.gamepad.snapshot();

  constructor(scene: Phaser.Scene) {
    if (!scene.input.keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('W,A,S,D,SPACE,E,B,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  movement(): Phaser.Math.Vector2 {
    this.gamepadSnapshot = this.gamepad.snapshot();
    const x =
      (this.cursors.right.isDown || this.keys.D.isDown ? 1 : 0) -
      (this.cursors.left.isDown || this.keys.A.isDown ? 1 : 0) +
      this.gamepadSnapshot.x;
    const y =
      (this.cursors.down.isDown || this.keys.S.isDown ? 1 : 0) -
      (this.cursors.up.isDown || this.keys.W.isDown ? 1 : 0) +
      this.gamepadSnapshot.y;

    return new Phaser.Math.Vector2(Phaser.Math.Clamp(x, -1, 1), Phaser.Math.Clamp(y, -1, 1));
  }

  pickPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this.gamepadSnapshot.pickPressed;
  }

  unloadPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.B) || this.gamepadSnapshot.unloadPressed;
  }

  pausePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.ESC) || this.gamepadSnapshot.pausePressed;
  }
}
