import { describe, expect, it } from 'vitest';
import {
  getLadderInteractionBounds,
  getMezzanineInput,
  getMezzanineMovement,
  isPlayerOverlappingLadder,
} from '../mezzanineMovement';

describe('mezzanine movement helpers', () => {
  it('detects ladder overlap from the player body bounds instead of only the center point', () => {
    const playerBounds = { x: 175, y: 480, width: 24, height: 42 };
    const ladders = [{ x: 206 - 14, y: 506 - 68, width: 28, height: 136 }];

    expect(isPlayerOverlappingLadder(playerBounds, ladders)).toBe(true);
  });

  it('keeps ladder overlap while the player crosses a platform band', () => {
    const playerBounds = { x: 206 - 11, y: 412, width: 22, height: 42 };
    const ladders = [getLadderInteractionBounds({ x: 206, y: 506, height: 136 })];

    expect(isPlayerOverlappingLadder(playerBounds, ladders)).toBe(true);
  });

  it('climbs vertically and disables gravity while overlapping a ladder', () => {
    expect(
      getMezzanineMovement({
        input: { left: false, right: false, up: true, down: false, jump: false },
        onLadder: true,
        isGrounded: false,
      }),
    ).toEqual({ velocityX: 0, velocityY: -145, allowGravity: false });

    expect(
      getMezzanineMovement({
        input: { left: false, right: false, up: false, down: true, jump: false },
        onLadder: true,
        isGrounded: false,
      }),
    ).toEqual({ velocityX: 0, velocityY: 145, allowGravity: false });
  });

  it('keeps ladder control through the platform collision band', () => {
    const ladder = getLadderInteractionBounds({ x: 206, y: 506, height: 136 });
    const playerAtTopPlatformBand = { x: 195, y: 420, width: 22, height: 42 };

    expect(isPlayerOverlappingLadder(playerAtTopPlatformBand, [ladder])).toBe(true);
  });

  it('builds the same inflated ladder bounds used by the mezzanine scene', () => {
    expect(getLadderInteractionBounds({ x: 206, y: 506, height: 136 })).toEqual({
      x: 190,
      y: 410,
      width: 32,
      height: 192,
    });
  });

  it('jumps from grounded platforms while preserving horizontal movement', () => {
    expect(
      getMezzanineMovement({
        input: { left: false, right: true, up: false, down: false, jump: true },
        onLadder: false,
        isGrounded: true,
      }),
    ).toEqual({ velocityX: 170, velocityY: -360, allowGravity: true });
  });

  it('maps controller movement and A-button jump into mezzanine movement input', () => {
    expect(
      getMezzanineInput({
        keyboard: { left: false, right: false, up: false, down: false, jump: false },
        gamepad: { x: -1, y: 1, pickPressed: true },
      }),
    ).toEqual({ left: true, right: false, up: false, down: true, jump: true });
  });
});
