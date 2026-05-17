import { describe, expect, it } from 'vitest';
import { getBossManPlacement } from '../finaleBossMan';

describe('getBossManPlacement', () => {
  it('places Boss Man in the right-side loading dock lane for stage three levels', () => {
    expect(getBossManPlacement(7)).toMatchObject({
      x: 888,
      y: 354,
      scale: 0.58,
      depth: 23,
    });
    expect(getBossManPlacement(8)).not.toBeNull();
    expect(getBossManPlacement(9)).not.toBeNull();
  });

  it('does not place Boss Man outside the loading dock stage', () => {
    expect(getBossManPlacement(6)).toBeNull();
    expect(getBossManPlacement(10)).toBeNull();
  });
});
