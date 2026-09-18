import { useState } from 'react';
import type { Priority, Task, TimelineRange, ColorPaletteName } from '../../types';
import { MIN_TASK_HOURS, isPositionValid } from '../../utils/taskLayout';
import { getNextAvailableColorName } from '../../utils/colorPalette';
import { useFieldUpdater } from './useFieldUpdater';

interface TaskFormState {
  title: string;
  description: string;
  priority: Priority;
  color: ColorPaletteName;
  startHour: string;
  durationHours: string;
}

export function useAddTaskForm({
  tasks,
  usedColors,
  timelineRange,
  onSave,
}: {
  tasks: Task[];
  usedColors: ColorPaletteName[];
  timelineRange: TimelineRange;
  onSave: (task: Omit<Task, 'id' | 'employeeId'>) => boolean;
}) {
  const [form, setForm] = useState<TaskFormState>({
    title: '',
    description: '',
    priority: 'Medium',
    color: getNextAvailableColorName(usedColors),
    startHour: String(timelineRange.startHour),
    durationHours: String(MIN_TASK_HOURS),
  });
  const updateField = useFieldUpdater(setForm);
  const startHour = Number(form.startHour);
  const durationHours = Number(form.durationHours);
  const isValid = form.title.trim().length > 0 && isPositionValid(startHour, durationHours, tasks, timelineRange);

  const handleSave = () =>
    onSave({
      title: form.title.trim(),
      priority: form.priority,
      color: form.color,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      startHour,
      durationHours,
    });

  return { form, setForm, updateField, isValid, handleSave };
}