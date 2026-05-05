import { describe, expect, it } from 'vitest';
import { getNextLevelNumber } from '../levelConfig';
import { finaleLevels, getFinaleLevelConfig, isFinaleLevel } from '../finaleConfig';

describe('finale level configuration', () => {
  it('defines shipping dock finale levels 7 through 9 with escalating activity', () => {
    expect(finaleLevels.map((level) => level.level)).toEqual([7, 8, 9]);
    expect(getFinaleLevelConfig(7)?.name).toBe('Conveyor Belt Sort');
    expect(getFinaleLevelConfig(8)?.name).toBe('Loading Dock Rush');
    expect(getFinaleLevelConfig(9)?.name).toBe('Final Truck Load Panic');
    expect(getFinaleLevelConfig(7)?.musicKeys).toEqual(['music-the-loading-dock']);
    expect(getFinaleLevelConfig(8)?.musicKeys).toEqual(['music-loading-bay-protocol']);
    expect(getFinaleLevelConfig(9)?.musicKeys).toEqual(['music-final-gate-opening']);
    expect(getFinaleLevelConfig(8)?.dockTargets.length).toBeGreaterThan(getFinaleLevelConfig(7)!.dockTargets.length);
    expect(getFinaleLevelConfig(9)?.hazards.length).toBeGreaterThan(getFinaleLevelConfig(8)!.hazards.length);
    expect(getFinaleLevelConfig(9)?.workers.length).toBeGreaterThan(getFinaleLevelConfig(7)!.workers.length);
  });

  it('identifies finale levels and includes them in progression after mezzanine', () => {
    expect(isFinaleLevel(6)).toBe(false);
    expect(isFinaleLevel(7)).toBe(true);
    expect(isFinaleLevel(9)).toBe(true);
    expect(isFinaleLevel(10)).toBe(false);
    expect(getNextLevelNumber(6)).toBe(7);
    expect(getNextLevelNumber(9)).toBe(10);
  });
});
