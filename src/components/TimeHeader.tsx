import { TIMELINE_HOURS, formatHour } from '../utils/board';

export default function TimeHeader() {
  return (
    <div className="timeline-header">
      <div className="timeline-header__spacer" />
      <div className="timeline-header__track">
        {Array.from({ length: TIMELINE_HOURS }, (_, i) => (
          <div key={i} className="timeline-header__label">
            {formatHour(i)}
          </div>
        ))}
      </div>
    </div>
  );
}
