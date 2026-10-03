import type { TimelineRange } from '../../types';
import { toTimelinePercent } from '../../utils/timelinePercent';

interface DropIndicatorProps {
  dropIndicatorSlot: number;
  timelineRange: TimelineRange;
}

export function DropIndicator({ dropIndicatorSlot, timelineRange }: DropIndicatorProps) {
  const left = toTimelinePercent(dropIndicatorSlot, timelineRange);

  return <div className="drop-indicator" style={{ left: `${left}%` }} />;
}