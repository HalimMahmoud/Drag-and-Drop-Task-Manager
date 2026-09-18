import type { TimelineRange } from '../types';

export const toTimelinePercent = (hour: number, range: TimelineRange) =>
  ((hour - range.startHour) / (range.endHour - range.startHour)) * 100;