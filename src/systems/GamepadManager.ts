export interface GamepadSnapshot {
  x: number;
  y: number;
  pickPressed: boolean;
  unloadPressed: boolean;
  pausePressed: boolean;
}

export class GamepadManager {
  private previousButtons = new Set<number>();

  snapshot(): GamepadSnapshot {
    const pads = navigator.getGamepads?.() ?? [];
    const pad = [...pads].find(Boolean);
    if (!pad) {
      this.previousButtons.clear();
      return { x: 0, y: 0, pickPressed: false, unloadPressed: false, pausePressed: false };
    }

    const buttons = new Set<number>();
    pad.buttons.forEach((button, index) => {
      if (button.pressed) {
        buttons.add(index);
      }
    });

    const xAxis = Math.abs(pad.axes[0] ?? 0) > 0.25 ? pad.axes[0] ?? 0 : 0;
    const yAxis = Math.abs(pad.axes[1] ?? 0) > 0.25 ? pad.axes[1] ?? 0 : 0;
    const dpadX = (buttons.has(15) ? 1 : 0) - (buttons.has(14) ? 1 : 0);
    const dpadY = (buttons.has(13) ? 1 : 0) - (buttons.has(12) ? 1 : 0);

    const snapshot = {
      x: dpadX || xAxis,
      y: dpadY || yAxis,
      pickPressed: this.wasPressed(buttons, 0),
      unloadPressed: this.wasPressed(buttons, 1),
      pausePressed: this.wasPressed(buttons, 9),
    };

    this.previousButtons = buttons;
    return snapshot;
  }

  private wasPressed(buttons: Set<number>, button: number): boolean {
    return buttons.has(button) && !this.previousButtons.has(button);
  }
}
