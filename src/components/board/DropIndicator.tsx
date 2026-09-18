import type { TimelineRange } from '../../types';
import { toTimelinePercent } from '../../utils/timelinePercent';

interface DropIndicatorProps {
  dropIndicatorHour: number;
  timelineRange: TimelineRange;
}

export function DropIndicator({ dropIndicatorHour, timelineRange }: DropIndicatorProps) {
  const left = toTimelinePercent(dropIndicatorHour, timelineRange);

  return <div className="drop-indicator" style={{ left: `${left}%` }} />;
}