import type { TimelineRange } from '../types';

/** Maps a slot index to a 0-100 percentage across the visible window. */
export const toTimelinePercent = (slot: number, range: TimelineRange) =>
  ((slot - range.startSlot) / (range.endSlot - range.startSlot)) * 100;