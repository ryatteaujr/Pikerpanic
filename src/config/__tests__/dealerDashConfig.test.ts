import { describe, expect, it } from 'vitest';
import { getNextLevelNumber } from '../levelConfig';
import { dealerDashLevels, getDealerDashLevelConfig, isDealerDashLevel } from '../dealerDashConfig';

describe('dealer dash level configuration', () => {
  it('defines level 10 as a delivery-driving finale with dealer stops', () => {
    const level = getDealerDashLevelConfig(10);

    expect(dealerDashLevels.map((config) => config.level)).toEqual([10]);
    expect(level?.name).toBe('Dealer-Dash');
    expect(level?.dealerStops.length).toBeGreaterThanOrEqual(3);
    expect(level?.traffic.length).toBeGreaterThanOrEqual(4);
    expect(level?.truckSpawn).toEqual({ x: 120, y: 500 });
  });

  it('identifies level 10 and routes progression from the loading dock finale', () => {
    expect(isDealerDashLevel(9)).toBe(false);
    expect(isDealerDashLevel(10)).toBe(true);
    expect(getNextLevelNumber(9)).toBe(10);
    expect(getNextLevelNumber(10)).toBeNull();
  });
});
