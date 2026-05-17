import { describe, expect, it } from 'vitest';
import { getNextLevelNumber } from '../levelConfig';
import { dealerDashLevels, getDealerDashLevelConfig, isDealerDashLevel } from '../dealerDashConfig';

describe('dealer dash level configuration', () => {
  it('defines level 13 as a delivery-driving finale with dealer stops', () => {
    const level = getDealerDashLevelConfig(13);

    expect(dealerDashLevels.map((config) => config.level)).toEqual([13]);
    expect(level?.name).toBe('Dealer-Dash');
    expect(level?.dealerStops.length).toBeGreaterThanOrEqual(3);
    expect(level?.traffic.length).toBeGreaterThanOrEqual(4);
    expect(level?.truckSpawn).toEqual({ x: 120, y: 500 });
  });

  it('identifies level 13 and routes progression after the truck-load puzzle levels', () => {
    expect(isDealerDashLevel(12)).toBe(false);
    expect(isDealerDashLevel(13)).toBe(true);
    expect(getNextLevelNumber(12)).toBe(13);
    expect(getNextLevelNumber(13)).toBeNull();
  });
});
