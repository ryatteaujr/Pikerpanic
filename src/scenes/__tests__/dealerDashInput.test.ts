import { describe, expect, it } from 'vitest';
import { getDealerDashInput, isTruckInDealerDeliveryZone } from '../dealerDashInput';

describe('dealer dash input', () => {
  it('maps controller movement and action buttons into truck input', () => {
    expect(
      getDealerDashInput({
        keyboard: { left: false, right: true, up: false, down: false, deliver: false },
        gamepad: { x: 0, y: -1, pickPressed: true, unloadPressed: false },
      }),
    ).toEqual({ left: false, right: true, up: true, down: false, deliver: true });
  });

  it('counts a delivery when the truck is docked just below the dealer sign', () => {
    expect(isTruckInDealerDeliveryZone({ x: 792, y: 224 }, { x: 792, y: 136 })).toBe(true);
  });

  it('does not count deliveries from the road away from the highlighted dealer', () => {
    expect(isTruckInDealerDeliveryZone({ x: 620, y: 300 }, { x: 792, y: 136 })).toBe(false);
  });
});
