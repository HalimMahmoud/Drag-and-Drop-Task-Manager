import { DEFAULT_TIMELINE_CONFIG, type TimelineConfig, type TimelineRange } from '../types';
import { getDefaultTimelineConfig, normalizeTimeUnit } from './timeUnits';
import { clampTimelineRange } from './timelineRange';

/**
 * Reads a stored `dashboards.config` blob into a usable {@link TimelineConfig}.
 *
 * Tolerates every shape that has ever been persisted:
 *   * `null` / missing                     -> the full plan for that unit
 *   * `{ startHour, endHour }`             -> legacy rows, slots mirror the hours
 *   * `{ startSlot, endSlot }`             -> slot rows without a unit
 *   * `{ unit, startSlot, endSlot }`       -> current shape
 *
 * Stored bounds are clamped into the unit's capacity, so a custom range survives
 * intact while an out-of-range or inverted one is repaired.
 *
 * This is the single entry point for config coming from the database, so the rest
 * of the app can assume `TimelineConfig` without re-checking.
 */
export function normalizeTimelineConfig(raw: unknown): TimelineConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_TIMELINE_CONFIG };
  }

  const config = raw as Record<string, unknown>;
  const unit = normalizeTimeUnit(config.unit);

  const startSlot = firstNumber(config.startSlot, config.startHour);
  const endSlot = firstNumber(config.endSlot, config.endHour);

  if (startSlot === null || endSlot === null) {
    return getDefaultTimelineConfig(unit);
  }

  return { unit, ...clampTimelineRange({ startSlot, endSlot }, unit) };
}

/** Narrows a {@link TimelineConfig} to just the window, for layout helpers. */
export function toTimelineRange(config: TimelineConfig): TimelineRange {
  return { startSlot: config.startSlot, endSlot: config.endSlot };
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const parsed = typeof value === 'string' ? Number(value) : value;
    if (typeof parsed === 'number' && Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}