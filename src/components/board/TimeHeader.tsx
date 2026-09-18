import type { TimelineRange } from '../../types';
import { getTimelineHours } from '../../utils/timelineHours';

interface TimeHeaderProps {
  timelineRange: TimelineRange;
}

export default function TimeHeader({ timelineRange }: TimeHeaderProps) {
  const timelineHours = getTimelineHours(timelineRange);
  const hours = Array.from({ length: timelineHours }, (_, index) => timelineRange.startHour + index);

  return (
    <div className="timeline-header">
      <div className="timeline-header__spacer" />
      <div
        className="timeline-header__track"
        style={{ gridTemplateColumns: `repeat(${timelineHours}, 1fr)` }}
      >
        {hours.map((hour) => (
          <div key={hour} className="timeline-header__label">{`${String(hour).padStart(2, '0')}:00`}</div>
        ))}
      </div>
    </div>
  );
}
