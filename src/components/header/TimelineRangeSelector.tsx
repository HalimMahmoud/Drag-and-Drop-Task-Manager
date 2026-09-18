import { MAX_TIMELINE_HOURS, type TimelineRange } from '../../types';
import { isValidTimelineRange } from '../../utils/timelineRange';
import { HourSelect } from './HourSelect';
import { PresetHours } from './PresetHours';
import { HiddenTasksNote } from './HiddenTasksNote';

interface TimelineRangeSelectorProps {
  timelineRange: TimelineRange;
  onTimelineRangeChange: (range: TimelineRange) => void;
  hiddenTaskCount: number;
}

const START_HOURS = Array.from({ length: MAX_TIMELINE_HOURS }, (_, hour) => hour);
const END_HOURS = Array.from({ length: MAX_TIMELINE_HOURS }, (_, hour) => hour + 1);

export default function TimelineRangeSelector({ timelineRange, onTimelineRangeChange, hiddenTaskCount }: TimelineRangeSelectorProps) {
  const { startHour, endHour } = timelineRange;
  const updateRange = (next: TimelineRange) => {
    if (isValidTimelineRange(next)) onTimelineRangeChange(next);
  };

  return (
    <div className="timeline-range">
      <span className="timeline-range__label">Hour range</span>
      <HourSelect
        label="Timeline start hour"
        value={startHour}
        hours={START_HOURS.filter((hour) => hour < endHour)}
        onChange={(hour) => updateRange({ startHour: hour, endHour: Math.min(Math.max(endHour, hour + 1), MAX_TIMELINE_HOURS) })}
      />
      <span>–</span>
      <HourSelect
        label="Timeline end hour"
        value={endHour}
        hours={END_HOURS.filter((hour) => hour > startHour)}
        onChange={(hour) => updateRange({ startHour: Math.max(Math.min(startHour, hour - 1), 0), endHour: hour })}
      />
      <span className="timeline-range__hint">{timelineRange.endHour - timelineRange.startHour}h / {MAX_TIMELINE_HOURS}h max</span>
      <PresetHours range={timelineRange} onSelect={updateRange} />
      <HiddenTasksNote count={hiddenTaskCount} />
    </div>
  );
}