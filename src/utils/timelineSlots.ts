import type { TimelineRange } from '../types';

/** Number of slots the timeline renders. Always >= 1 for a valid range. */
export const getTimelineSlots = (range: TimelineRange) => range.endSlot - range.startSlot;