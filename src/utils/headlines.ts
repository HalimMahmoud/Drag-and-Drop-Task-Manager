import type { Employee, Task, TimeUnit, TimelineConfig, TimelineRange } from '../types';
import { formatSlot, formatUnitCount } from './timeUnits';

const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

/** Accepts either a full config or a bare range so callers can stay unit-agnostic. */
const readConfig = (source: TimelineConfig | TimelineRange): TimelineConfig =>
  'unit' in source ? source : { ...source, unit: 'hours' as TimeUnit };

/**
 * A window's width alone reads ambiguously for hours (slot 0 and slot 12 are both
 * "12:00"), so an offset window also names the slot it starts at.
 */
export function formatBoardHeadline(
  employees: Employee[],
  tasks: Task[],
  source: TimelineConfig | TimelineRange
): string {
  const { startSlot, endSlot, unit } = readConfig(source);
  const span = formatUnitCount(endSlot - startSlot, unit);
  const window = startSlot === 0 ? span : `${span} \u00B7 from ${formatSlot(startSlot, unit)}`;

  if (employees.length === 0) {
    return `No team members scheduled yet \u00B7 ${window}`;
  }

  return `${pluralize(employees.length, 'member', 'members')} \u00B7 ${pluralize(
    tasks.length,
    'task',
    'tasks'
  )} \u00B7 ${window}`;
}

export function formatBoardsHeadline(count: number, query: string): string {
  const trimmed = query.trim();

  if (trimmed) {
    return `Showing boards matching \u201C${trimmed}\u201D`;
  }

  if (count === 0) {
    return 'No boards created yet';
  }

  return `${pluralize(count, 'board', 'boards')} \u00B7 schedule work across a horizontal timeline`;
}