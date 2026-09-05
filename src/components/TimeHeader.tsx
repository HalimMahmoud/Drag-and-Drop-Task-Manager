import { TIMELINE_HOURS, formatHour } from '../utils/board';

export default function TimeHeader() {
  return (
    <div className="timeline-header">
      <div className="timeline-header__spacer" />
      <div className="timeline-header__track">
        {Array.from({ length: TIMELINE_HOURS }, (_, hour) => (
          <div key={hour} className="timeline-header__label">{formatHour(hour)}</div>
        ))}
      </div>
    </div>
  );
}
