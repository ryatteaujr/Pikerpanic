import { describe, expect, it } from 'vitest';
import { scoringConfig } from '../../config/scoringConfig';
import { ScoreManager } from '../ScoreManager';
import { TicketManager } from '../TicketManager';
import { formatTimer, getLoadPerformancePerHour } from '../TimerManager';
import { getGrade } from '../GradeManager';
import { getLevelConfig, getNextLevelNumber, levelConfigs } from '../../config/levelConfig';
import { finaleLevels, getFinaleLevelConfig, isFinaleLevel } from '../../config/finaleConfig';
import { getMezzanineLevelConfig, mezzanineLevels } from '../../config/mezzanineConfig';
import { getSoundEffectPlan } from '../SoundEffectManager';

describe('TicketManager', () => {
  it('tracks correct picks, capacity, unload progress, and accuracy', () => {
    const ticket = new TicketManager(
      [
        { type: 'Hammers', quantity: 2 },
        { type: 'Tape', quantity: 1 },
      ],
      2,
    );

    expect(ticket.pick('Hammers')).toEqual({ ok: true, reason: 'picked' });
    expect(ticket.pick('Tape')).toEqual({ ok: true, reason: 'picked' });
    expect(ticket.pick('Hammers')).toEqual({ ok: false, reason: 'full' });
    expect(ticket.accuracyPercent).toBe(100);

    expect(ticket.unload()).toEqual({ unloaded: 2, completed: false });
    expect(ticket.completedCount).toBe(2);
    expect(ticket.pick('Drill Bits')).toEqual({ ok: false, reason: 'wrong' });
    expect(ticket.accuracyPercent).toBe(67);
    expect(ticket.pick('Hammers')).toEqual({ ok: true, reason: 'picked' });
    expect(ticket.unload()).toEqual({ unloaded: 1, completed: true });
    expect(ticket.isComplete).toBe(true);
  });

  it('tracks fragile breakage as an accuracy hit while carrying fragile freight', () => {
    const ticket = new TicketManager([{ type: 'Fragile', quantity: 1 }], 2);

    expect(ticket.pick('Fragile')).toEqual({ ok: true, reason: 'picked' });
    expect(ticket.isCarrying('Fragile')).toBe(true);

    ticket.recordFragileBreakage();

    expect(ticket.accuracyPercent).toBe(50);
  });

  it('can unload only the item types accepted by the target chute', () => {
    const ticket = new TicketManager(
      [
        { type: 'Hammers', quantity: 1 },
        { type: 'Freezer Pack', quantity: 1 },
      ],
      2,
    );

    ticket.pick('Hammers');
    ticket.pick('Freezer Pack');

    expect(ticket.unloadTypes(['Freezer Pack'])).toEqual({ unloaded: 1, completed: false });
    expect(ticket.carriedCount).toBe(1);
    expect(ticket.completedCount).toBe(1);

    expect(ticket.unloadTypes(['Hammers'])).toEqual({ unloaded: 1, completed: true });
    expect(ticket.isComplete).toBe(true);
  });
});

describe('ScoreManager', () => {
  it('scores pickups, combo picks, unloads, and completion bonuses', () => {
    const score = new ScoreManager(scoringConfig);

    score.addRegularBox();
    score.addCorrectPick(3);
    score.addUnload();
    score.addCompletionBonus(12);
    score.addWrongPickPenalty();

    expect(score.value).toBe(10 + 300 + 250 + 500 + 120 - 100);
  });
});

describe('TimerManager helpers', () => {
  it('formats countdown time and calculates LPH from completed picks', () => {
    expect(formatTimer(277)).toBe('04:37');
    expect(formatTimer(0)).toBe('00:00');
    expect(getLoadPerformancePerHour(3, 75)).toBe(144);
  });
});

describe('GradeManager', () => {
  it('grades end of level performance', () => {
    expect(getGrade({ accuracy: 100, lives: 3, remainingSeconds: 90 })).toBe('S: Perfect Picker');
    expect(getGrade({ accuracy: 96, lives: 2, remainingSeconds: 30 })).toBe('A: Load Boss');
    expect(getGrade({ accuracy: 82, lives: 1, remainingSeconds: 10 })).toBe('B: Solid Shift');
    expect(getGrade({ accuracy: 70, lives: 1, remainingSeconds: 0 })).toBe('C: Needs Coaching');
  });
});

describe('SoundEffectManager', () => {
  it('defines distinct arcade cues for pickup, drop-off, and crash actions', () => {
    const pickup = getSoundEffectPlan('pickup');
    const dropoff = getSoundEffectPlan('dropoff');
    const crash = getSoundEffectPlan('crash');

    expect(pickup.steps.length).toBeGreaterThan(0);
    expect(dropoff.steps.length).toBeGreaterThan(pickup.steps.length);
    expect(crash.steps[0].frequency).toBeLessThan(pickup.steps[0].frequency);
    expect(crash.volume).toBeGreaterThan(pickup.volume);
  });
});

describe('level configuration', () => {
  it('advances through all ten campaign levels', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(getNextLevelNumber)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, null]);
  });

  it('keeps level one order and chute unchanged', () => {
    const levelOne = getLevelConfig(1);

    expect(levelOne.chute).toBe('06');
    expect(levelOne.chutePosition).toEqual({ x: 736, y: 538 });
    expect(levelOne.requiredItems.reduce((sum, line) => sum + line.quantity, 0)).toBe(6);
    expect(levelOne.musicKeys).toEqual(['music-expedite-load', 'music-schedule-failure', 'music-priority-override']);
  });

  it('adds a larger level two order with a moved chute and new item types', () => {
    const levelTwo = getLevelConfig(2);
    const itemTypes = levelTwo.requiredItems.map((line) => line.type);

    expect(levelConfigs.length).toBeGreaterThanOrEqual(2);
    expect(levelTwo.chute).not.toBe('06');
    expect(levelTwo.chutePosition).not.toEqual(getLevelConfig(1).chutePosition);
    expect(levelTwo.requiredItems.reduce((sum, line) => sum + line.quantity, 0)).toBeGreaterThan(6);
    expect(itemTypes).toContain('Fragile');
    expect(itemTypes).toContain('Water Heater');
    expect(levelTwo.musicKeys).toEqual(['music-warehouse-gridlock', 'music-loading-bay-breach', 'music-final-boss-sprint']);
  });

  it('adds level three cold-chain routing with two forklifts and pedestrians', () => {
    const levelThree = getLevelConfig(3);
    const itemTypes = levelThree.requiredItems.map((line) => line.type);

    expect(levelConfigs).toHaveLength(3);
    expect(itemTypes).toContain('Freezer Pack');
    expect(levelThree.coldChute).toEqual({ id: '03', x: 736, y: 238 });
    expect(levelThree.forklifts).toHaveLength(2);
    expect(levelThree.pedestrians).toHaveLength(3);
  });
});

describe('mezzanine level configuration', () => {
  it('defines three vertical platform levels with increasing hazard density', () => {
    expect(mezzanineLevels.map((level) => level.level)).toEqual([4, 5, 6]);
    expect(getMezzanineLevelConfig(4)?.name).toBe('Hard Goods Climb');
    expect(getMezzanineLevelConfig(4)?.musicKeys).toEqual(['music-steel-beam-ascent']);
    expect(getMezzanineLevelConfig(5)?.musicKeys).toEqual(['music-watch-your-step']);
    expect(getMezzanineLevelConfig(6)?.musicKeys).toEqual(['music-top-score-hazard']);
    expect(getMezzanineLevelConfig(5)?.hazards.length).toBeGreaterThan(getMezzanineLevelConfig(4)!.hazards.length);
    expect(getMezzanineLevelConfig(6)?.pedestrians.length).toBeGreaterThan(getMezzanineLevelConfig(5)!.pedestrians.length);
  });
});

describe('finale level configuration', () => {
  it('defines three finale levels for the truck-loading sequence', () => {
    expect(finaleLevels.map((level) => level.level)).toEqual([7, 8, 9]);
    expect(getFinaleLevelConfig(7)?.name).toBe('Conveyor Belt Sort');
    expect(getFinaleLevelConfig(8)?.name).toBe('Loading Dock Rush');
    expect(getFinaleLevelConfig(9)?.name).toBe('Final Truck Load Panic');
    expect(isFinaleLevel(6)).toBe(false);
    expect(isFinaleLevel(7)).toBe(true);
    expect(isFinaleLevel(9)).toBe(true);
  });
});
