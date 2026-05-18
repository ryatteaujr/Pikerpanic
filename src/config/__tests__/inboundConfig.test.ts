import { describe, expect, it } from 'vitest';
import { getSceneKeyForLevel } from '../startConfig';
import { getInboundTrainingConfig, inboundTrainingConfig } from '../inboundConfig';

describe('inbound receiving config', () => {
  it('defines inbound receiving as optional training outside the level chain', () => {
    expect(inboundTrainingConfig.name).toBe('Inbound Delivery Training');
    expect(getInboundTrainingConfig().targetPallets).toBe(6);
    expect(getSceneKeyForLevel(1)).toBe('GameScene');
  });

  it('does not include arcade fail-state fields in training config', () => {
    expect('timerSeconds' in inboundTrainingConfig).toBe(false);
    expect('lives' in inboundTrainingConfig).toBe(false);
  });
});
