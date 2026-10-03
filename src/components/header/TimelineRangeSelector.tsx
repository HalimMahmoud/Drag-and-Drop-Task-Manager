import { useCallback } from 'react';
import type { TimeUnit, TimelineConfig } from '../../types';
import { isValidTimelineRange } from '../../utils/timelineRange';
import { getMaxSlots, getTimeUnitDefinition, formatUnitCount, getSelectableSlots } from '../../utils/timeUnits';
import { getDefaultTimelineConfig } from '../../utils/timeUnits';
import { SlotSelect } from './SlotSelect';
import { TimeUnitTabs } from './TimeUnitTabs';
import { HiddenTasksNote } from './HiddenTasksNote';

interface TimelineRangeSelectorProps {
  timelineConfig: TimelineConfig;
  onTimelineConfigChange: (config: TimelineConfig) => void;
  hiddenTaskCount: number;
}

export default function TimelineRangeSelector({
  timelineConfig,
  onTimelineConfigChange,
  hiddenTaskCount,
}: TimelineRangeSelectorProps) {
  const { unit, startSlot, endSlot } = timelineConfig;
  const maxSlots = getMaxSlots(unit);
  const { singular } = getTimeUnitDefinition(unit);

  const updateConfig = useCallback(
    (next: TimelineConfig) => {
      if (isValidTimelineRange(next, next.unit)) onTimelineConfigChange(next);
    },
    [onTimelineConfigChange],
  );

  const handleUnitChange = useCallback(
    (nextUnit: TimeUnit) => {
      // A new granularity gets its own full-width window, since the old bounds rarely
      // mean anything on a different grid.
      updateConfig(getDefaultTimelineConfig(nextUnit));
    },
    [updateConfig],
  );

  const allSlots = getSelectableSlots(unit);

  return (
    <div className="timeline-range">
      <span className="timeline-range__label">Time plan</span>
      <TimeUnitTabs unit={unit} onSelect={handleUnitChange} />

      <span className="timeline-range__label">{singular} range</span>
      <SlotSelect
        label="Timeline start"
        value={startSlot}
        slots={allSlots.filter((slot) => slot < endSlot)}
        unit={unit}
        onChange={(slot) => updateConfig({ ...timelineConfig, startSlot: slot })}
      />
      <span aria-hidden="true">&ndash;</span>
      <SlotSelect
        label="Timeline end"
        value={endSlot}
        slots={allSlots.filter((slot) => slot > startSlot)}
        unit={unit}
        onChange={(slot) => updateConfig({ ...timelineConfig, endSlot: slot })}
      />

      <span className="timeline-range__hint">
        {formatUnitCount(endSlot - startSlot, unit)} / {formatUnitCount(maxSlots, unit)} max
      </span>
      <HiddenTasksNote count={hiddenTaskCount} />
    </div>
  );
}