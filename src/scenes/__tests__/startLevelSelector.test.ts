import { describe, expect, it } from 'vitest';
import {
  getCoinMenuStageLines,
  getLevelFromNumberKey,
  getStageStartLevel,
  getStartLevelStage,
  moveSelectedStage,
  moveSelectedStartLevel,
  startLevelOptions,
} from '../startLevelSelector';

describe('start level selector', () => {
  it('wraps level selection through the thirteen campaign levels', () => {
    expect(startLevelOptions).toHaveLength(13);
    expect(moveSelectedStartLevel(1, -1)).toBe(13);
    expect(moveSelectedStartLevel(13, 1)).toBe(1);
    expect(moveSelectedStartLevel(4, 1)).toBe(5);
  });

  it('maps number keys to startup levels with zero selecting level ten', () => {
    expect(getLevelFromNumberKey('ONE')).toBe(1);
    expect(getLevelFromNumberKey('FOUR')).toBe(4);
    expect(getLevelFromNumberKey('ZERO')).toBe(10);
    expect(getLevelFromNumberKey('C')).toBeNull();
  });

  it('groups the coin menu into five described stages', () => {
    expect(getStartLevelStage(1)?.title).toBe('WAREHOUSE PICK');
    expect(getStartLevelStage(10)?.rangeLabel).toBe('LEVELS 10-12');
    expect(getStartLevelStage(13)?.rangeLabel).toBe('LEVEL 13');

    const lines = getCoinMenuStageLines(11);

    expect(lines).toHaveLength(5);
    expect(lines[3]).toContain('> STAGE 4');
    expect(lines[3]).toContain('TRUCK LOAD');
    expect(lines[3]).toContain('Stack cargo puzzle pieces into clean rows.');
  });

  it('selects the first playable level in a stage card', () => {
    expect(getStageStartLevel(1)).toBe(1);
    expect(getStageStartLevel(4)).toBe(10);
    expect(getStageStartLevel(5)).toBe(13);
    expect(getStageStartLevel(99)).toBeNull();
  });

  it('moves stage-card selection with keyboard or controller directions', () => {
    expect(moveSelectedStage(1, 1)).toBe(4);
    expect(moveSelectedStage(4, 1)).toBe(7);
    expect(moveSelectedStage(7, 1)).toBe(10);
    expect(moveSelectedStage(10, 1)).toBe(13);
    expect(moveSelectedStage(13, 1)).toBe(1);
    expect(moveSelectedStage(10, -1)).toBe(7);
  });
});
