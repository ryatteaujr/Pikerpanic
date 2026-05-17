import { describe, expect, it } from 'vitest';
import { getMezzanineCollectibleStyle } from '../mezzanineCollectibleStyle';

describe('mezzanine collectible styles', () => {
  it('gives level-four target items distinct colors from enemy boxes', () => {
    const styles = ['TOOLS', 'PAINT', 'BOX', 'PIPE'].map(getMezzanineCollectibleStyle);

    expect(new Set(styles.map((style) => style.fill)).size).toBe(4);
    expect(styles.map((style) => style.fill)).not.toContain(0xd87922);
    expect(styles.map((style) => style.fill)).not.toContain(0x9b5b28);
  });
});
