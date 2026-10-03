import type { TimeUnit, TimelineRange } from '../types';
import { getMaxSlots } from './timeUnits';

/**
 * A range is valid when both bounds are whole slots inside the unit's capacity and
 * the window is not empty. The unit supplies the ceiling (24 hours, 31 days,
 * 52 weeks, ...).
 */
export const isValidTimelineRange = (range: TimelineRange, unit: TimeUnit) => {
  const maxSlots = getMaxSlots(unit);
  return (
    Number.isInteger(range.startSlot) &&
    Number.isInteger(range.endSlot) &&
    range.startSlot >= 0 &&
    range.endSlot <= maxSlots &&
    range.startSlot < range.endSlot
  );
};

/**
 * Clamps a range into the unit's capacity without ever inverting the bounds.
 * A window is at least one slot wide, so an inverted input collapses to one slot
 * rather than becoming unreadable.
 */
export const clampTimelineRange = (range: TimelineRange, unit: TimeUnit): TimelineRange => {
  const maxSlots = getMaxSlots(unit);
  const startSlot = Math.min(Math.max(Math.floor(range.startSlot) || 0, 0), Math.max(maxSlots - 1, 0));
  const endSlot = Math.min(Math.max(Math.floor(range.endSlot) || 1, startSlot + 1), maxSlots);
  return { startSlot, endSlot };
};