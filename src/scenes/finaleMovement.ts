export interface FinaleMovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

interface FinaleInputState {
  keyboard: FinaleMovementInput;
  gamepad: {
    x: number;
    y: number;
  };
}

export interface FinaleMovementResult {
  velocityX: number;
  velocityY: number;
}

export interface PointLike {
  x: number;
  y: number;
}

export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DockBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const PLAYER_SPEED = 190;
export const FINALE_PLAYER_SPEED = 178;
export const FINALE_CONVEYOR_FACTOR = 0.7;

export function getFinaleMovement(input: FinaleMovementInput): FinaleMovementResult {
  const directionX = input.left === input.right ? 0 : input.left ? -1 : 1;
  const directionY = input.up === input.down ? 0 : input.up ? -1 : 1;

  if (directionX === 0 && directionY === 0) {
    return { velocityX: 0, velocityY: 0 };
  }

  const length = Math.hypot(directionX, directionY);
  return {
    velocityX: (directionX / length) * PLAYER_SPEED,
    velocityY: (directionY / length) * PLAYER_SPEED,
  };
}

export function getFinaleInput(state: FinaleInputState): FinaleMovementInput {
  return {
    left: state.keyboard.left || state.gamepad.x < -0.25,
    right: state.keyboard.right || state.gamepad.x > 0.25,
    up: state.keyboard.up || state.gamepad.y < -0.25,
    down: state.keyboard.down || state.gamepad.y > 0.25,
  };
}

export function clampToDockBounds(point: PointLike, bounds: DockBounds): PointLike {
  return {
    x: Math.min(bounds.right, Math.max(bounds.left, point.x)),
    y: Math.min(bounds.bottom, Math.max(bounds.top, point.y)),
  };
}

export function isNearDockTarget(player: PointLike, target: PointLike, radius: number): boolean {
  return Math.hypot(player.x - target.x, player.y - target.y) <= radius;
}

export function getFinaleVelocity(input: FinaleMovementInput, conveyorVx = 0): { x: number; y: number } {
  const x = input.left === input.right ? 0 : input.left ? -FINALE_PLAYER_SPEED : FINALE_PLAYER_SPEED;
  const y = input.up === input.down ? 0 : input.up ? -FINALE_PLAYER_SPEED : FINALE_PLAYER_SPEED;

  return {
    x: x + conveyorVx * FINALE_CONVEYOR_FACTOR,
    y,
  };
}

export function rectsOverlap(a: RectLike, b: RectLike): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function bodyRect(x: number, y: number, width: number, height: number): RectLike {
  return {
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
  };
}
