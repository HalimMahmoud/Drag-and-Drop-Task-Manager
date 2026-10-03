import { describe, expect, it } from 'vitest';
import { EMPLOYEES, INITIAL_TASKS } from '../utils/seed';
import {
  findNearestValidStartSlot,
  isPositionValid,
  isTaskVisibleInRange,
  MIN_TASK_SLOTS,
  nextTaskColor,
  priorityToColorKey,
  snapToSlot,
} from '../utils/taskLayout';
import {
  formatAxisSlot,
  formatSlot,
  formatSlotRange,
  formatUnitCount,
  getDefaultTimelineConfig,
  getFullTimelineRange,
  getSelectableSlots,
  hoursToSlots,
  isTimeUnit,
  normalizeTimeUnit,
  slotsToHours,
  TIME_UNITS,
} from '../utils/timeUnits';
import { formatBoardHeadline, formatBoardsHeadline } from '../utils/headlines';
import { getTimelineSlots } from '../utils/timelineSlots';
import { clampTimelineRange, isValidTimelineRange } from '../utils/timelineRange';
import { normalizeTimelineConfig, toTimelineRange } from '../utils/timelineConfig';
import { toTimelinePercent } from '../utils/timelinePercent';
import type { Task, TimelineConfig, TimelineRange } from '../types';

// A board always shows its whole plan, so an hours board is the 0-24 window.
const range: TimelineRange = { startSlot: 0, endSlot: 24 };

const task = (overrides: Partial<Task>): Task => ({
  id: 't1',
  employeeId: 'e1',
  title: 'Task',
  description: '',
  priority: 'Medium',
  durationSlot: 1,
  startSlot: 0,
  color: 'red',
  ...overrides,
});

describe('getTimelineSlots', () => {
  it('returns the width of the window', () => {
    expect(getTimelineSlots(getFullTimelineRange('hours'))).toBe(24);
    expect(getTimelineSlots(getFullTimelineRange('weeks'))).toBe(52);
  });
});

describe('isValidTimelineRange', () => {
  it.each([
    [{ startSlot: 0, endSlot: 24 }, 'hours', true],
    [{ startSlot: 0, endSlot: 31 }, 'days', true],
    [{ startSlot: 9, endSlot: 17 }, 'hours', true],
    [{ startSlot: 3, endSlot: 4 }, 'weeks', true],
    [{ startSlot: 0, endSlot: 52 }, 'weeks', true],
    // Empty, inverted and out-of-capacity windows are rejected.
    [{ startSlot: 5, endSlot: 5 }, 'hours', false],
    [{ startSlot: 6, endSlot: 5 }, 'hours', false],
    [{ startSlot: -1, endSlot: 5 }, 'hours', false],
    [{ startSlot: 0, endSlot: 25 }, 'hours', false],
    [{ startSlot: 0, endSlot: 26 }, 'hours', false],
    [{ startSlot: 0, endSlot: 53 }, 'weeks', false],
    [{ startSlot: 0, endSlot: 7 }, 'years', false],
    [{ startSlot: 0.5, endSlot: 5 }, 'hours', false],
    [{ startSlot: 1, endSlot: 2.5 }, 'hours', false],
  ] as const)('range %o on %s is %s', (candidate, unit, expected) => {
    expect(isValidTimelineRange(candidate, unit)).toBe(expected);
  });
});

describe('clampTimelineRange', () => {
  it('keeps bounds inside the unit capacity', () => {
    expect(clampTimelineRange({ startSlot: 30, endSlot: 40 }, 'days')).toEqual({
      startSlot: 30,
      endSlot: 31,
    });
    expect(clampTimelineRange({ startSlot: -5, endSlot: 4 }, 'hours')).toEqual({
      startSlot: 0,
      endSlot: 4,
    });
    expect(clampTimelineRange({ startSlot: 0, endSlot: 900 }, 'months')).toEqual({
      startSlot: 0,
      endSlot: 12,
    });
  });

  it('never inverts or empties the window', () => {
    expect(clampTimelineRange({ startSlot: 10, endSlot: 2 }, 'hours')).toEqual({
      startSlot: 10,
      endSlot: 11,
    });
    expect(clampTimelineRange({ startSlot: 4, endSlot: 4 }, 'hours')).toEqual({
      startSlot: 4,
      endSlot: 5,
    });
  });

  it('leaves a valid custom range untouched', () => {
    expect(clampTimelineRange({ startSlot: 9, endSlot: 17 }, 'hours')).toEqual({
      startSlot: 9,
      endSlot: 17,
    });
  });

  it('always produces a valid range', () => {
    for (const unit of TIME_UNITS) {
      for (const candidate of [
        { startSlot: 7, endSlot: 11 },
        { startSlot: -3, endSlot: 999 },
        { startSlot: 5, endSlot: 5 },
      ]) {
        expect(isValidTimelineRange(clampTimelineRange(candidate, unit), unit)).toBe(true);
      }
    }
  });
});

describe('normalizeTimelineConfig', () => {
  it('falls back to the full hours board', () => {
    expect(normalizeTimelineConfig(null)).toEqual({ unit: 'hours', startSlot: 0, endSlot: 24 });
    expect(normalizeTimelineConfig(undefined)).toEqual({ unit: 'hours', startSlot: 0, endSlot: 24 });
    expect(normalizeTimelineConfig('nonsense')).toEqual({ unit: 'hours', startSlot: 0, endSlot: 24 });
  });

  it('reads legacy startHour/endHour rows', () => {
    expect(normalizeTimelineConfig({ startHour: 9, endHour: 17 })).toEqual({
      unit: 'hours',
      startSlot: 9,
      endSlot: 17,
    });
  });

  it('reads slot rows without a unit', () => {
    expect(normalizeTimelineConfig({ startSlot: 2, endSlot: 10 })).toEqual({
      unit: 'hours',
      startSlot: 2,
      endSlot: 10,
    });
  });

  it('reads the current shape', () => {
    expect(normalizeTimelineConfig({ unit: 'days', startSlot: 3, endSlot: 20 })).toEqual({
      unit: 'days',
      startSlot: 3,
      endSlot: 20,
    });
  });

  it('defaults to the full window when the bounds are missing', () => {
    expect(normalizeTimelineConfig({ unit: 'days' })).toEqual({
      unit: 'days',
      startSlot: 0,
      endSlot: 31,
    });
  });

  it('repairs an over-long or inverted range', () => {
    expect(normalizeTimelineConfig({ unit: 'hours', startSlot: 0, endSlot: 900 })).toEqual({
      unit: 'hours',
      startSlot: 0,
      endSlot: 24,
    });
    expect(normalizeTimelineConfig({ unit: 'weeks', startSlot: 9, endSlot: 2 })).toEqual({
      unit: 'weeks',
      startSlot: 9,
      endSlot: 10,
    });
  });

  it('coerces an unknown unit to hours but keeps the window', () => {
    expect(normalizeTimelineConfig({ unit: 'fortnights', startSlot: 1, endSlot: 5 })).toEqual({
      unit: 'hours',
      startSlot: 1,
      endSlot: 5,
    });
  });
});

describe('toTimelineRange', () => {
  it('narrows a config to its window', () => {
    const config: TimelineConfig = { unit: 'weeks', startSlot: 4, endSlot: 52 };
    expect(toTimelineRange(config)).toEqual({ startSlot: 4, endSlot: 52 });
  });
});

describe('time unit conversions', () => {
  it('round-trips slots through absolute hours', () => {
    expect(slotsToHours(3, 'hours')).toBe(3);
    expect(slotsToHours(2, 'days')).toBe(48);
    expect(slotsToHours(1, 'weeks')).toBe(168);
    expect(hoursToSlots(48, 'days')).toBe(2);
    expect(hoursToSlots(24, 'days')).toBe(1);
    expect(hoursToSlots(168, 'weeks')).toBe(1);
  });

  it('rounds partial units down onto the containing slot', () => {
    expect(hoursToSlots(1, 'weeks')).toBe(0);
    expect(hoursToSlots(84, 'weeks')).toBe(1);
  });

  it('re-anchors a slot across units by absolute position', () => {
    expect(hoursToSlots(slotsToHours(6, 'hours'), 'days')).toBe(0);
    expect(hoursToSlots(slotsToHours(30, 'hours'), 'days')).toBe(1);
    expect(hoursToSlots(slotsToHours(1, 'weeks'), 'months')).toBe(0);
  });
});

describe('unit normalization', () => {
  it('accepts every supported unit', () => {
    expect(TIME_UNITS).toEqual(['hours', 'days', 'weeks', 'months', 'years']);
    for (const unit of TIME_UNITS) expect(isTimeUnit(unit)).toBe(true);
  });

  it('coerces anything unknown to hours', () => {
    expect(normalizeTimeUnit('days')).toBe('days');
    expect(normalizeTimeUnit(undefined)).toBe('hours');
    expect(normalizeTimeUnit('decades')).toBe('hours');
    expect(normalizeTimeUnit(7)).toBe('hours');
  });
});

describe('full timeline configs', () => {
  it('spans each unit from zero to its capacity', () => {
    expect(getFullTimelineRange('hours')).toEqual({ startSlot: 0, endSlot: 24 });
    expect(getFullTimelineRange('days')).toEqual({ startSlot: 0, endSlot: 31 });
    expect(getFullTimelineRange('weeks')).toEqual({ startSlot: 0, endSlot: 52 });
    expect(getFullTimelineRange('months')).toEqual({ startSlot: 0, endSlot: 12 });
    expect(getFullTimelineRange('years')).toEqual({ startSlot: 0, endSlot: 6 });
  });

  it('is where a board starts out, and stays adjustable after that', () => {
    expect(getDefaultTimelineConfig('hours')).toEqual({ unit: 'hours', startSlot: 0, endSlot: 24 });
    expect(getDefaultTimelineConfig('days')).toEqual({ unit: 'days', startSlot: 0, endSlot: 31 });
    expect(getDefaultTimelineConfig('weeks')).toEqual({ unit: 'weeks', startSlot: 0, endSlot: 52 });
    expect(getDefaultTimelineConfig('months')).toEqual({ unit: 'months', startSlot: 0, endSlot: 12 });
    expect(getDefaultTimelineConfig('years')).toEqual({ unit: 'years', startSlot: 0, endSlot: 6 });
  });

  it('produces a range that passes its own validation', () => {
    for (const unit of TIME_UNITS) {
      expect(isValidTimelineRange(getFullTimelineRange(unit), unit)).toBe(true);
    }
  });
});

describe('selectable slots', () => {
  it('offers slot 0 through the unit capacity so either bound can be chosen', () => {
    expect(getSelectableSlots('hours')).toHaveLength(25);
    expect(getSelectableSlots('hours')[0]).toBe(0);
    expect(getSelectableSlots('hours')[24]).toBe(24);
    expect(getSelectableSlots('days')).toHaveLength(32);
    expect(getSelectableSlots('days')[31]).toBe(31);
    expect(getSelectableSlots('years')).toHaveLength(7);
    expect(getSelectableSlots('years')[6]).toBe(6);
  });
});

describe('slot formatting', () => {
  it('renders hours on a padded 24h clock', () => {
    expect(formatAxisSlot(0, 'hours')).toBe('00:00');
    expect(formatAxisSlot(9, 'hours')).toBe('09:00');
    expect(formatAxisSlot(13, 'hours')).toBe('13:00');
    expect(formatAxisSlot(23, 'hours')).toBe('23:00');
  });

  it('numbers every unit from zero, like hours', () => {
expect(formatAxisSlot(0, 'days')).toBe('0');
    expect(formatAxisSlot(30, 'days')).toBe('30');
    expect(formatSlot(0, 'days')).toBe('day 0');
    expect(formatSlot(2, 'weeks')).toBe('week 2');
    expect(formatSlot(0, 'years')).toBe('year 0');
    expect(formatSlot(51, 'weeks')).toBe('week 51');
    expect(formatSlot(11, 'months')).toBe('month 11');
  });

  it('renders a readable span', () => {
    expect(formatSlotRange(9, 3, 'hours')).toBe('09:00\u201312:00');
    expect(formatSlotRange(2, 3, 'days')).toBe('day 2\u2013day 5');
    expect(formatSlotRange(0, 5, 'weeks')).toBe('week 0\u2013week 5');
  });

  it('pluralizes unit counts', () => {
    expect(formatUnitCount(1, 'days')).toBe('1 day');
    expect(formatUnitCount(12, 'hours')).toBe('12 hours');
    expect(formatUnitCount(3, 'months')).toBe('3 months');
  });
});

describe('toTimelinePercent', () => {
  it('maps slots to percentages within the range', () => {
    expect(toTimelinePercent(0, range)).toBe(0);
    expect(toTimelinePercent(12, range)).toBe(50);
    expect(toTimelinePercent(24, range)).toBe(100);
  });

  it('works for an offset window', () => {
    const offset = { startSlot: 4, endSlot: 12 };
    expect(toTimelinePercent(4, offset)).toBe(0);
    expect(toTimelinePercent(8, offset)).toBe(50);
    expect(toTimelinePercent(12, offset)).toBe(100);
  });
});

describe('isTaskVisibleInRange', () => {
  it('is true when the task fits inside the range', () => {
    expect(isTaskVisibleInRange(task({ startSlot: 4, durationSlot: 2 }), range)).toBe(true);
  });

  it('is false when the task starts before or ends after the range', () => {
    expect(isTaskVisibleInRange(task({ startSlot: -1 }), range)).toBe(false);
    expect(isTaskVisibleInRange(task({ startSlot: 23, durationSlot: 2 }), range)).toBe(false);
  });
});

describe('isPositionValid', () => {
  const occupied = [task({ id: 'a', startSlot: 2, durationSlot: 2 })];

  it('accepts a free slot', () => {
    expect(isPositionValid(4, 2, occupied, range)).toBe(true);
  });

  it('rejects overlapping slots', () => {
    expect(isPositionValid(3, 1, occupied, range)).toBe(false);
    expect(isPositionValid(1, 2, occupied, range)).toBe(false);
  });

  it('rejects out-of-range positions and non-integers', () => {
    expect(isPositionValid(-1, 1, [], range)).toBe(false);
    expect(isPositionValid(23, 2, [], range)).toBe(false);
    expect(isPositionValid(1.5, 1, [], range)).toBe(false);
    expect(isPositionValid(1, 1.5, [], range)).toBe(false);
  });

  it('treats an offset window as the only legal area', () => {
    const offset = { startSlot: 6, endSlot: 12 };
    expect(isPositionValid(5, 1, [], offset)).toBe(false);
    expect(isPositionValid(6, 1, [], offset)).toBe(true);
  });
});

describe('findNearestValidStartSlot', () => {
  const occupied = [task({ id: 'a', startSlot: 2, durationSlot: 2 })];

  it('returns the nearest valid start slot', () => {
    expect(findNearestValidStartSlot(3, 1, occupied, range)).toBe(4);
    expect(findNearestValidStartSlot(0, 1, occupied, range)).toBe(0);
  });

  it('returns null when the task cannot fit', () => {
    expect(findNearestValidStartSlot(0, 25, [], range)).toBeNull();
  });

  it('pushes a task into a narrower window', () => {
    expect(findNearestValidStartSlot(0, 4, [], { startSlot: 8, endSlot: 12 })).toBe(8);
  });
});

describe('snapToSlot', () => {
  // 480px across 24 hour-slots, so one slot is 20px wide.
  const rect = { left: 0, top: 0, right: 480, bottom: 144, width: 480, height: 144 } as DOMRect;

  it('snaps client x to the nearest slot', () => {
    expect(snapToSlot(40, rect, 0, 1, range)).toBe(2);
    expect(snapToSlot(100, rect, 0, 1, range)).toBe(5);
  });

  it('clamps to the available range', () => {
    expect(snapToSlot(10000, rect, 0, 2, range)).toBe(22);
    expect(snapToSlot(-10000, rect, 0, 1, range)).toBe(0);
  });

  it('accounts for the drag offset', () => {
    expect(snapToSlot(80, rect, 40, 1, range)).toBe(2);
  });

  it('scales slot width for a shorter window', () => {
    expect(snapToSlot(200, rect, 0, 1, { startSlot: 0, endSlot: 6 })).toBe(3);
  });
});

describe('nextTaskColor', () => {
  it('returns the first unused palette color', () => {
    expect(nextTaskColor([])).toBe('#ef4444');
    expect(nextTaskColor(['#ef4444'])).toBe('#f97316');
  });

  it('cycles once the palette is exhausted', () => {
    const palette = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16',
      '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
      '#8b5cf6', '#ec4899', '#e11d48', '#0ea5e9',
    ];
    expect(nextTaskColor(palette)).toBe('#ef4444');
  });
});

describe('priorityToColorKey', () => {
  it('lowercases priorities into color keys', () => {
    expect(priorityToColorKey('High')).toBe('high');
    expect(priorityToColorKey('Medium')).toBe('medium');
    expect(priorityToColorKey('Low')).toBe('low');
  });
});

describe('seed data invariants', () => {
  it('gives every employee a distinct id', () => {
    const ids = EMPLOYEES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every task a distinct id and color', () => {
    const ids = INITIAL_TASKS.map((t) => t.id);
    const colors = INITIAL_TASKS.flatMap((t) => (t.color ? [t.color] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('places every task in a valid slot with at least the minimum duration', () => {
    const byEmployee = (employeeId: string) =>
      INITIAL_TASKS.filter((t) => t.employeeId === employeeId);

    for (const t of INITIAL_TASKS) {
      const others = byEmployee(t.employeeId).filter((o) => o.id !== t.id);
      expect(MIN_TASK_SLOTS).toBeLessThanOrEqual(t.durationSlot);
      expect(isPositionValid(t.startSlot, t.durationSlot, others, { startSlot: 0, endSlot: 24 })).toBe(true);
    }
  });
});

describe('headlines', () => {
  it('summarizes a populated board with counts and the plan width', () => {
    const headline = formatBoardHeadline(EMPLOYEES, INITIAL_TASKS, range);
    expect(headline).toBe(
      `${EMPLOYEES.length} members \u00B7 ${INITIAL_TASKS.length} tasks \u00B7 24 hours`
    );
  });

  it('uses singular labels for a single member and single task', () => {
    const headline = formatBoardHeadline([EMPLOYEES[0]], INITIAL_TASKS.slice(0, 1), range);
    expect(headline).toBe('1 member \u00B7 1 task \u00B7 24 hours');
  });

  it('reports an empty board instead of zero counts', () => {
    expect(formatBoardHeadline([], [], range)).toBe(
      'No team members scheduled yet \u00B7 24 hours'
    );
  });

  it('spells out the unit of a non-hours plan', () => {
    expect(formatBoardHeadline([EMPLOYEES[0]], [], getDefaultTimelineConfig('days'))).toBe(
      '1 member \u00B7 0 tasks \u00B7 31 days'
    );
    expect(formatBoardHeadline([EMPLOYEES[0]], [], getDefaultTimelineConfig('years'))).toBe(
      '1 member \u00B7 0 tasks \u00B7 6 years'
    );
    expect(formatBoardHeadline([EMPLOYEES[0]], [], getDefaultTimelineConfig('months'))).toBe(
      '1 member \u00B7 0 tasks \u00B7 12 months'
    );
  });

  it('names the start slot when the window is offset', () => {
    const headline = formatBoardHeadline([EMPLOYEES[0]], [], {
      unit: 'hours',
      startSlot: 9,
      endSlot: 17,
    });
    expect(headline).toBe('1 member \u00B7 0 tasks \u00B7 8 hours \u00B7 from 09:00');
  });

  it('reports a narrowed window by its width', () => {
    expect(
      formatBoardHeadline([EMPLOYEES[0]], [], { unit: 'weeks', startSlot: 4, endSlot: 12 })
    ).toBe('1 member \u00B7 0 tasks \u00B7 8 weeks \u00B7 from week 4');
  });

  it('defaults to hours when given a bare range', () => {
    expect(formatBoardHeadline([EMPLOYEES[0]], [], { startSlot: 0, endSlot: 6 })).toBe(
      '1 member \u00B7 0 tasks \u00B7 6 hours'
    );
  });

  it('summarizes the board list', () => {
    expect(formatBoardsHeadline(3, '')).toBe(
      '3 boards \u00B7 schedule work across a horizontal timeline'
    );
    expect(formatBoardsHeadline(1, '')).toBe(
      '1 board \u00B7 schedule work across a horizontal timeline'
    );
  });

  it('reports an empty board list', () => {
    expect(formatBoardsHeadline(0, '')).toBe('No boards created yet');
  });

  it('echoes the active search query', () => {
    expect(formatBoardsHeadline(3, '  roadmap  ')).toBe(
      'Showing boards matching \u201Croadmap\u201D'
    );
  });
});