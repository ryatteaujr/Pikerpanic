import { describe, expect, it } from 'vitest';
import { getNextLevelNumber } from '../levelConfig';
import { dealerDashLevels, getDealerDashLevelConfig, isDealerDashLevel } from '../dealerDashConfig';
import { getTruckLoadLevelConfig, isTruckLoadLevel, truckLoadLevels } from '../truckLoadConfig';
import { getSceneKeyForLevel } from '../startConfig';

describe('truck load level configuration', () => {
  it('inserts three truck-loading puzzle levels before the renumbered DealerDash finale', () => {
    expect(truckLoadLevels.map((level) => level.level)).toEqual([10, 11, 12]);
    expect(getTruckLoadLevelConfig(10)?.name).toBe('Truck Load');
    expect(isTruckLoadLevel(9)).toBe(false);
    expect(isTruckLoadLevel(10)).toBe(true);
    expect(isTruckLoadLevel(12)).toBe(true);
    expect(isTruckLoadLevel(13)).toBe(false);
  });

  it('routes campaign progression through truck load levels and then DealerDash level thirteen', () => {
    expect([9, 10, 11, 12, 13].map(getNextLevelNumber)).toEqual([10, 11, 12, 13, null]);
    expect(getSceneKeyForLevel(10)).toBe('TruckLoadScene');
    expect(getSceneKeyForLevel(12)).toBe('TruckLoadScene');
    expect(getSceneKeyForLevel(13)).toBe('DealerDashScene');
    expect(dealerDashLevels.map((level) => level.level)).toEqual([13]);
    expect(getDealerDashLevelConfig(13)?.name).toBe('Dealer-Dash');
    expect(isDealerDashLevel(10)).toBe(false);
    expect(isDealerDashLevel(13)).toBe(true);
  });
});
