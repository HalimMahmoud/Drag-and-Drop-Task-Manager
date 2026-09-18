import type { Dispatch, SetStateAction } from 'react';
import type { TimelineRange } from '../../types';
import { MIN_TASK_HOURS } from '../../utils/taskLayout';
import { useFieldUpdater } from '../../hooks/form/useFieldUpdater';
import { Input } from '@/components/ui/input';
import { Field } from './Field';

interface TaskScheduleFieldsProps<T extends { startHour: string; durationHours: string }> {
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  timelineRange: TimelineRange;
}

export function TaskScheduleFields<T extends { startHour: string; durationHours: string }>({
  form,
  setForm,
  timelineRange,
}: TaskScheduleFieldsProps<T>) {
  const updateField = useFieldUpdater(setForm);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Start hour">
        <Input
          type="number"
          min={timelineRange.startHour}
          max={timelineRange.endHour - 1}
          value={form.startHour}
          onChange={(e) => updateField('startHour', e.target.value)}
        />
      </Field>
      <Field label="Duration (h)">
        <Input
          type="number"
          min={MIN_TASK_HOURS}
          max={timelineRange.endHour - timelineRange.startHour}
          value={form.durationHours}
          onChange={(e) => updateField('durationHours', e.target.value)}
        />
      </Field>
    </div>
  );
}