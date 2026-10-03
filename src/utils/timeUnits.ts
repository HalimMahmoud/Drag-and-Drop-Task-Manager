import type { TimeUnit, TimelineConfig, TimelineRange } from '../types';

export interface TimeUnitDefinition {
  unit: TimeUnit;
  /** Human label used in selectors, e.g. "Hours". */
  label: string;
  /** Compact suffix for dense labels, e.g. "h" or "mo". */
  short: string;
  /** "hour" / "day" */
  singular: string;
  /** "hours" / "days" */
  plural: string;
  /** How many absolute hours a single slot of this unit represents. */
  hoursPerSlot: number;
  /** Largest number of slots a board of this unit may span, i.e. its visible width. */
  maxSlots: number;
}

export const TIME_UNIT_DEFINITIONS: Record<TimeUnit, TimeUnitDefinition> = {
  hours: {
    unit: 'hours',
    label: 'Hours',
    short: 'h',
    singular: 'hour',
    plural: 'hours',
    hoursPerSlot: 1,
    maxSlots: 24,
  },
  days: {
    unit: 'days',
    label: 'Days',
    short: 'd',
    singular: 'day',
    plural: 'days',
    hoursPerSlot: 24,
    maxSlots: 31,
  },
  weeks: {
    unit: 'weeks',
    label: 'Weeks',
    short: 'w',
    singular: 'week',
    plural: 'weeks',
    hoursPerSlot: 24 * 7,
    maxSlots: 52,
  },
  months: {
    unit: 'months',
    label: 'Months',
    short: 'mo',
    singular: 'month',
    plural: 'months',
    hoursPerSlot: 24 * 30,
    maxSlots: 12,
  },
  years: {
    unit: 'years',
    label: 'Years',
    short: 'y',
    singular: 'year',
    plural: 'years',
    hoursPerSlot: 24 * 365,
    maxSlots: 6,
  },
};

/** Selector order, from the finest to the coarsest granularity. */
export const TIME_UNITS: TimeUnit[] = ['hours', 'days', 'weeks', 'months', 'years'];

export const DEFAULT_TIME_UNIT: TimeUnit = 'hours';

export function getTimeUnitDefinition(unit: TimeUnit): TimeUnitDefinition {
  return TIME_UNIT_DEFINITIONS[unit];
}

export function isTimeUnit(value: unknown): value is TimeUnit {
  return typeof value === 'string' && value in TIME_UNIT_DEFINITIONS;
}

/** Coerces anything (including legacy rows with no unit) into a supported unit. */
export function normalizeTimeUnit(value: unknown): TimeUnit {
  return isTimeUnit(value) ? value : DEFAULT_TIME_UNIT;
}

export function getMaxSlots(unit: TimeUnit): number {
  return TIME_UNIT_DEFINITIONS[unit].maxSlots;
}

export function getHoursPerSlot(unit: TimeUnit): number {
  return TIME_UNIT_DEFINITIONS[unit].hoursPerSlot;
}

export function slotsToHours(slots: number, unit: TimeUnit): number {
  return slots * getHoursPerSlot(unit);
}

export function hoursToSlots(hours: number, unit: TimeUnit): number {
  return Math.round(hours / getHoursPerSlot(unit));
}

/** The visible axis label. Hours render as a 24h clock; every other unit is numbered. */
/**
 * Every unit is numbered from slot 0, matching the slot index a task is stored with.
 * Hours additionally render as a padded 24h clock, which is the one place a clock
 * face reads better than a bare number.
 */
export function formatAxisSlot(slot: number, unit: TimeUnit): string {
  const index = Math.floor(slot);
  if (unit === 'hours') {
    const hour = ((index % 24) + 24) % 24;
    return `${String(hour).padStart(2, '0')}:00`;
  }
  return String(index);
}

/** A readable position label, e.g. "09:00", "day 3", "week 5". */
export function formatSlot(slot: number, unit: TimeUnit): string {
  const { singular } = getTimeUnitDefinition(unit);
  if (unit === 'hours') return formatAxisSlot(slot, unit);
  return `${singular} ${Math.floor(slot)}`;
}

/** A readable span label, e.g. "09:00–12:00" or "Day 3–Day 5". */
export function formatSlotRange(startSlot: number, durationSlot: number, unit: TimeUnit): string {
  return `${formatSlot(startSlot, unit)}\u2013${formatSlot(startSlot + durationSlot, unit)}`;
}

/** "3 days" / "1 hour" / "12 weeks" */
export function formatUnitCount(count: number, unit: TimeUnit): string {
  const { singular, plural } = getTimeUnitDefinition(unit);
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * The default window for a unit: the whole plan, from slot 0 to its capacity.
 * Both bounds are still user-adjustable, this is just where a board starts out.
 */
export function getFullTimelineRange(unit: TimeUnit): TimelineRange {
  return { startSlot: 0, endSlot: getMaxSlots(unit) };
}

export function getDefaultTimelineConfig(unit: TimeUnit): TimelineConfig {
  return { unit, ...getFullTimelineRange(unit) };
}

/**
 * Slot values offered by the start and end selectors: 0 through the unit's capacity.
 * The start list filters out `endSlot` and the end list filters out `startSlot`, so
 * either bound always leaves at least one visible slot.
 */
export function getSelectableSlots(unit: TimeUnit): number[] {
  return Array.from({ length: getMaxSlots(unit) + 1 }, (_, index) => index);
}