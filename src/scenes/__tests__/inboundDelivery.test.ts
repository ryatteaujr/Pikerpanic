import { describe, expect, it } from 'vitest';
import { advanceInboundUnload, getInboundTrainingCompletion, isNearInboundPoint } from '../inboundDelivery';

describe('inbound delivery rules', () => {
  it('allows picking at the inbound truck door when not carrying freight', () => {
    expect(isNearInboundPoint({ x: 132, y: 326 }, { x: 132, y: 326 }, 58)).toBe(true);
  });

  it('counts an unloaded pallet and finishes at the target count', () => {
    expect(advanceInboundUnload({ unloaded: 5, target: 6, carrying: true })).toEqual({
      unloaded: 6,
      target: 6,
      carrying: false,
      completed: true,
    });
  });

  it('does not unload when the forklift is empty', () => {
    expect(advanceInboundUnload({ unloaded: 2, target: 6, carrying: false })).toEqual({
      unloaded: 2,
      target: 6,
      carrying: false,
      completed: false,
    });
  });

  it('returns to the start screen when training is complete', () => {
    expect(getInboundTrainingCompletion()).toEqual({
      scene: 'StartScene',
      message: 'TRAINING COMPLETE',
    });
  });
});
