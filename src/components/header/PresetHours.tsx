import { MAX_TIMELINE_HOURS, type TimelineRange } from '../../types';

const PRESET_HOURS = [3, 6, 9, 12, 18, 24];

interface PresetHoursProps {
  range: TimelineRange;
  onSelect: (range: TimelineRange) => void;
}

export function PresetHours({ range, onSelect }: PresetHoursProps) {
  return (
    <>
      {PRESET_HOURS.map((hours) => (
        <button
          key={hours}
          type="button"
          className={
            'timeline-range__preset' +
            (range.startHour + hours <= MAX_TIMELINE_HOURS && range.endHour - range.startHour === hours
              ? ' timeline-range__preset--active'
              : '')
          }
          onClick={() =>
            onSelect({
              startHour: range.startHour,
              endHour: Math.min(range.startHour + hours, MAX_TIMELINE_HOURS),
            })
          }
        >
          {hours}h
        </button>
      ))}
    </>
  );
}