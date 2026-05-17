import { describe, expect, it } from 'vitest';
import { isPrimaryActionButton } from '../StartAction';

describe('StartAction', () => {
  it('treats the controller A button as the primary start action', () => {
    expect(isPrimaryActionButton(0)).toBe(true);
    expect(isPrimaryActionButton(1)).toBe(false);
  });
});
