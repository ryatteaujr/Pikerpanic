export interface BoundsLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MezzanineMovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
}

export interface MezzanineMovementState {
  input: MezzanineMovementInput;
  onLadder: boolean;
  isGrounded: boolean;
}

export interface MezzanineMovementResult {
  velocityX: number;
  velocityY?: number;
  allowGravity: boolean;
}

const PLAYER_SPEED = 170;
const CLIMB_SPEED = 145;
const JUMP_SPEED = 360;
export const LADDER_PLATFORM_OVERLAP = 28;

export function isPlayerOverlappingLadder(playerBounds: BoundsLike, ladders: BoundsLike[]): boolean {
  return ladders.some((ladder) => rectanglesOverlap(playerBounds, ladder));
}

export function getLadderInteractionBounds(ladder: { x: number; y: number; height: number }): BoundsLike {
  return {
    x: ladder.x - 16,
    y: ladder.y - ladder.height / 2 - LADDER_PLATFORM_OVERLAP,
    width: 32,
    height: ladder.height + LADDER_PLATFORM_OVERLAP * 2,
  };
}

export function getMezzanineMovement(state: MezzanineMovementState): MezzanineMovementResult {
  const { input } = state;
  const velocityX = input.left === input.right ? 0 : input.left ? -PLAYER_SPEED : PLAYER_SPEED;

  if (state.onLadder) {
    return {
      velocityX,
      velocityY: input.up === input.down ? 0 : input.up ? -CLIMB_SPEED : CLIMB_SPEED,
      allowGravity: false,
    };
  }

  if (input.jump && state.isGrounded) {
    return { velocityX, velocityY: -JUMP_SPEED, allowGravity: true };
  }

  return { velocityX, allowGravity: true };
}

function rectanglesOverlap(a: BoundsLike, b: BoundsLike): boolean {
  return a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y;
}
