import { describe, expect, it } from 'vitest';
import {
  MEZZANINE_COLLISION,
  getBodyWorldRect,
  resolveSpawnSafeX,
  rectsOverlap,
} from '../mezzanineCollision';

describe('mezzanine collision geometry', () => {
  it('matches hazard and worker bodies to their visible sprites', () => {
    expect(getBodyWorldRect(100, 200, MEZZANINE_COLLISION.hazard.body)).toEqual({
      x: 83,
      y: 188,
      width: 34,
      height: 24,
    });

    expect(getBodyWorldRect(100, 200, MEZZANINE_COLLISION.worker.body)).toEqual({
      x: 91,
      y: 170,
      width: 18,
      height: 34,
    });
  });

  it('keeps marked worker zones visual-only', () => {
    expect(MEZZANINE_COLLISION.worker.zone.collides).toBe(false);
  });

  it('moves starting bodies out of the protected spawn area when there is patrol room', () => {
    const spawnClearance = { x: 70, y: 500, width: 70, height: 76 };

    const safeX = resolveSpawnSafeX({
      x: 100,
      y: 530,
      body: MEZZANINE_COLLISION.worker.body,
      blockedArea: spawnClearance,
      minX: 70,
      maxX: 200,
      gap: 6,
    });

    expect(safeX).toBe(155);
    expect(rectsOverlap(getBodyWorldRect(safeX, 530, MEZZANINE_COLLISION.worker.body), spawnClearance)).toBe(false);
  });
});
