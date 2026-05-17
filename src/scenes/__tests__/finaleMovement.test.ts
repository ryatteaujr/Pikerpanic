import { describe, expect, it } from 'vitest';
import { bodyRect, getFinaleInput, getFinaleVelocity, rectsOverlap } from '../finaleMovement';

describe('finale movement helpers', () => {
  it('keeps free movement open in all four directions', () => {
    expect(getFinaleVelocity({ left: false, right: true, up: false, down: false })).toEqual({ x: 178, y: 0 });
    expect(getFinaleVelocity({ left: false, right: false, up: true, down: false })).toEqual({ x: 0, y: -178 });
  });

  it('adds conveyor push without replacing player control', () => {
    expect(getFinaleVelocity({ left: true, right: false, up: false, down: false }, 40)).toEqual({ x: -150, y: 0 });
  });

  it('creates centered body rectangles for fair collision checks', () => {
    expect(bodyRect(100, 120, 30, 42)).toEqual({ x: 85, y: 99, width: 30, height: 42 });
    expect(rectsOverlap(bodyRect(100, 120, 30, 42), { x: 112, y: 100, width: 20, height: 20 })).toBe(true);
  });

  it('maps controller movement into finale movement input', () => {
    expect(
      getFinaleInput({
        keyboard: { left: false, right: false, up: false, down: true },
        gamepad: { x: -1, y: 0 },
      }),
    ).toEqual({ left: true, right: false, up: false, down: true });
  });
});
