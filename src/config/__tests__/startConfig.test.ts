import { describe, expect, it } from 'vitest';
import { startConfig } from '../startConfig';

describe('start configuration', () => {
  it('starts new games at level one by default', () => {
    expect(startConfig.scene).toBe('GameScene');
    expect(startConfig.level).toBe(1);
  });
});
