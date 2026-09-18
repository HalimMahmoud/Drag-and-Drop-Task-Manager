import { describe, expect, it } from 'vitest';
import { EMPLOYEES, INITIAL_TASKS } from '../utils/seed';
import {
  findNearestValidStartHour,
  isPositionValid,
  isTaskVisibleInRange,
  MIN_TASK_HOURS,
  nextTaskColor,
  priorityToColorKey,
  snapToHour,
} from '../utils/taskLayout';
import { formatClockHour, formatHour } from '../utils/timeFormat';
import { getTimelineHours } from '../utils/timelineHours';
import { isValidTimelineRange } from '../utils/timelineRange';
import { toTimelinePercent } from '../utils/timelinePercent';
import type { Task, TimelineRange } from '../types';

const range: TimelineRange = { startHour: 0, endHour: 12 };

const task = (overrides: Partial<Task>): Task => ({
  id: 't1',
  employeeId: 'e1',
  title: 'Task',
  description: '',
  priority: 'Medium',
  durationHours: 1,
  startHour: 0,
  color: 'red',
  ...overrides,
});

describe('getTimelineHours', () => {
  it('returns the span of the range', () => {
    expect(getTimelineHours({ startHour: 3, endHour: 8 })).toBe(5);
  });
});

describe('isValidTimelineRange', () => {
  it.each([
    [{ startHour: 0, endHour: 12 }, true],
    [{ startHour: 4, endHour: 24 }, true],
    [{ startHour: 5, endHour: 5 }, false],
    [{ startHour: 6, endHour: 5 }, false],
    [{ startHour: -1, endHour: 5 }, false],
    [{ startHour: 2, endHour: 26 }, false],
    [{ startHour: 0.5, endHour: 5 }, false],
  ] as const)('range %o is %s', (candidate, expected) => {
    expect(isValidTimelineRange(candidate)).toBe(expected);
  });
});

describe('formatClockHour / formatHour', () => {
  it('pads clock hours', () => {
    expect(formatClockHour(9)).toBe('09:00');
    expect(formatClockHour(13)).toBe('13:00');
  });

  it('renders 12-hour labels', () => {
    expect(formatHour(0)).toBe('12:00');
    expect(formatHour(12)).toBe('12:00');
    expect(formatHour(13)).toBe('1:00');
    expect(formatHour(23)).toBe('11:00');
  });
});

describe('toTimelinePercent', () => {
  it('maps hours to percentages within the range', () => {
    expect(toTimelinePercent(0, range)).toBe(0);
    expect(toTimelinePercent(6, range)).toBe(50);
    expect(toTimelinePercent(12, range)).toBe(100);
  });
});

describe('isTaskVisibleInRange', () => {
  it('is true when the task fits inside the range', () => {
    expect(isTaskVisibleInRange(task({ startHour: 4, durationHours: 2 }), range)).toBe(true);
  });

  it('is false when the task starts before or ends after the range', () => {
    expect(isTaskVisibleInRange(task({ startHour: -1 }), range)).toBe(false);
    expect(isTaskVisibleInRange(task({ startHour: 11, durationHours: 2 }), range)).toBe(false);
  });
});

describe('isPositionValid', () => {
  const occupied = [task({ id: 'a', startHour: 2, durationHours: 2 })];

  it('accepts a free slot', () => {
    expect(isPositionValid(4, 2, occupied, range)).toBe(true);
  });

  it('rejects overlapping slots', () => {
    expect(isPositionValid(3, 1, occupied, range)).toBe(false);
    expect(isPositionValid(1, 2, occupied, range)).toBe(false);
  });

  it('rejects out-of-range positions and non-integers', () => {
    expect(isPositionValid(-1, 1, [], range)).toBe(false);
    expect(isPositionValid(11, 2, [], range)).toBe(false);
    expect(isPositionValid(1.5, 1, [], range)).toBe(false);
    expect(isPositionValid(1, 1.5, [], range)).toBe(false);
  });
});

describe('findNearestValidStartHour', () => {
  const occupied = [task({ id: 'a', startHour: 2, durationHours: 2 })];

  it('returns the nearest valid start hour', () => {
    expect(findNearestValidStartHour(3, 1, occupied, range)).toBe(4);
    expect(findNearestValidStartHour(0, 1, occupied, range)).toBe(0);
  });

  it('returns null when the task cannot fit', () => {
    expect(findNearestValidStartHour(0, 13, [], range)).toBeNull();
  });
});

describe('snapToHour', () => {
  const rect = { left: 0, top: 0, right: 480, bottom: 144, width: 480, height: 144 } as DOMRect;

  it('snaps client x to the nearest hour', () => {
    expect(snapToHour(40, rect, 0, 1, range)).toBe(1);
    expect(snapToHour(100, rect, 0, 1, range)).toBe(3);
  });

  it('clamps to the available range', () => {
    expect(snapToHour(10000, rect, 0, 2, range)).toBe(10);
    expect(snapToHour(-10000, rect, 0, 1, range)).toBe(0);
  });

  it('accounts for the drag offset', () => {
    expect(snapToHour(80, rect, 40, 1, range)).toBe(1);
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
      expect(MIN_TASK_HOURS).toBeLessThanOrEqual(t.durationHours);
      expect(isPositionValid(t.startHour, t.durationHours, others, { startHour: 0, endHour: 24 })).toBe(true);
    }
  });
});