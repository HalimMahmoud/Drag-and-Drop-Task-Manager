import { MAX_TIMELINE_HOURS, type TimelineRange } from '../types';

export const isValidTimelineRange = (range: TimelineRange) =>
  Number.isInteger(range.startHour) &&
  Number.isInteger(range.endHour) &&
  range.startHour >= 0 &&
  range.endHour <= MAX_TIMELINE_HOURS &&
  range.startHour < range.endHour &&
  range.endHour - range.startHour <= MAX_TIMELINE_HOURS;