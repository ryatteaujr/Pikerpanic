import { describe, expect, it } from 'vitest';
import { scoringConfig } from '../../config/scoringConfig';
import { ScoreManager } from '../ScoreManager';
import { TicketManager } from '../TicketManager';
import { formatTimer, getLoadPerformancePerHour } from '../TimerManager';
import { getGrade } from '../GradeManager';

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
