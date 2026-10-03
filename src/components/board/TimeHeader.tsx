import type { TimelineConfig } from '../../types';
import { getTimelineSlots } from '../../utils/timelineSlots';
import { formatAxisSlot } from '../../utils/timeUnits';

interface TimeHeaderProps {
  timelineConfig: TimelineConfig;
}

export default function TimeHeader({ timelineConfig }: TimeHeaderProps) {
  const timelineSlots = getTimelineSlots(timelineConfig);
  const slots = Array.from({ length: timelineSlots }, (_, index) => timelineConfig.startSlot + index);

  return (
    <div className="timeline-header">
      <div className="timeline-header__spacer" />
      <div
        className="timeline-header__track"
        style={{ gridTemplateColumns: `repeat(${timelineSlots}, 1fr)` }}
      >
        {slots.map((slot) => (
          <div key={slot} className="timeline-header__label">
            {formatAxisSlot(slot, timelineConfig.unit)}
          </div>
        ))}
      </div>
    </div>
  );
}