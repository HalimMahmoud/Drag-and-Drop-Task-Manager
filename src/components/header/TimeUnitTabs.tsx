import type { TimeUnit } from '../../types';
import { TIME_UNITS, TIME_UNIT_DEFINITIONS } from '../../utils/timeUnits';

/** Renders one tab per granularity so a board can be re-planned in place. */
export function TimeUnitTabs({
  unit,
  onSelect,
}: {
  unit: TimeUnit;
  onSelect: (unit: TimeUnit) => void;
}) {
  return (
    <>
      {TIME_UNITS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === unit}
          className={
            'timeline-range__preset' +
            (option === unit ? ' timeline-range__preset--active' : '')
          }
          onClick={() => onSelect(option)}
        >
          {TIME_UNIT_DEFINITIONS[option].label}
        </button>
      ))}
    </>
  );
}