import type { Dispatch, SetStateAction } from 'react';
import type { TimeUnit, TimelineRange } from '../../types';
import { MIN_TASK_SLOTS } from '../../utils/taskLayout';
import { getTimeUnitDefinition } from '../../utils/timeUnits';
import { useFieldUpdater } from '../../hooks/form/useFieldUpdater';
import { Input } from '@/components/ui/input';
import { Field } from './Field';

interface TaskScheduleFieldsProps<T extends { startSlot: string; durationSlot: string }> {
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  timelineRange: TimelineRange;
  unit: TimeUnit;
}

export function TaskScheduleFields<T extends { startSlot: string; durationSlot: string }>({
  form,
  setForm,
  timelineRange,
  unit,
}: TaskScheduleFieldsProps<T>) {
  const updateField = useFieldUpdater(setForm);
  const { singular, plural } = getTimeUnitDefinition(unit);
  const timelineSlots = timelineRange.endSlot - timelineRange.startSlot;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={`Starts at (${singular})`}>
        <Input
          type="number"
          min={timelineRange.startSlot}
          max={timelineRange.endSlot - 1}
          value={form.startSlot}
          onChange={(e) => updateField('startSlot', e.target.value)}
        />
      </Field>
      <Field label={`Duration (${plural})`}>
        <Input
          type="number"
          min={MIN_TASK_SLOTS}
          max={timelineSlots}
          value={form.durationSlot}
          onChange={(e) => updateField('durationSlot', e.target.value)}
        />
      </Field>
    </div>
  );
}