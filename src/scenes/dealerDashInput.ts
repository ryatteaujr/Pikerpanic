export interface DealerDashInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  deliver: boolean;
}

interface DealerDashInputState {
  keyboard: DealerDashInput;
  gamepad: {
    x: number;
    y: number;
    pickPressed: boolean;
    unloadPressed: boolean;
  };
}

export function getDealerDashInput(state: DealerDashInputState): DealerDashInput {
  return {
    left: state.keyboard.left || state.gamepad.x < -0.25,
    right: state.keyboard.right || state.gamepad.x > 0.25,
    up: state.keyboard.up || state.gamepad.y < -0.25,
    down: state.keyboard.down || state.gamepad.y > 0.25,
    deliver: state.keyboard.deliver || state.gamepad.pickPressed || state.gamepad.unloadPressed,
  };
}

export function isTruckInDealerDeliveryZone(
  truck: { x: number; y: number },
  stop: { x: number; y: number },
): boolean {
  return Math.abs(truck.x - stop.x) <= 106 && Math.abs(truck.y - stop.y) <= 92;
}
