import { useState } from 'react';
import type { Priority, Task, TimelineRange, ColorPaletteName } from '../../types';
import { MIN_TASK_SLOTS, isPositionValid } from '../../utils/taskLayout';
import { getNextAvailableColorName } from '../../utils/colorPalette';
import { useFieldUpdater } from './useFieldUpdater';

interface TaskFormState {
  title: string;
  description: string;
  priority: Priority;
  color: ColorPaletteName;
  startSlot: string;
  durationSlot: string;
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
    startSlot: String(timelineRange.startSlot),
    durationSlot: String(MIN_TASK_SLOTS),
  });
  const updateField = useFieldUpdater(setForm);
  const startSlot = Number(form.startSlot);
  const durationSlot = Number(form.durationSlot);
  const isValid = form.title.trim().length > 0 && isPositionValid(startSlot, durationSlot, tasks, timelineRange);

  const handleSave = () =>
    onSave({
      title: form.title.trim(),
      priority: form.priority,
      color: form.color,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      startSlot,
      durationSlot,
    });

  return { form, setForm, updateField, isValid, handleSave };
}