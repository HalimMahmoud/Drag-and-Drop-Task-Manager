import type { TimelineRange } from '../types';

export const getTimelineHours = (range: TimelineRange) => range.endHour - range.startHour;