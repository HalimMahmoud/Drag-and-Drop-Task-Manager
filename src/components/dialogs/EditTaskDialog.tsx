import { useState, type ReactNode } from 'react';
import type { Priority, Task, ColorPaletteName } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogFooterButtons } from './DialogFooterButtons';
import { TaskCommonFields } from './TaskCommonFields';
import { getNextAvailableColorName, COLOR_PALETTE } from '../../utils/colorPalette';

interface EditTaskDialogProps {
  trigger?: ReactNode;
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Omit<Task, 'id'>>) => void;
}

export function EditTaskDialog({ trigger, task, open, onOpenChange, onSave }: EditTaskDialogProps) {
  const fallbackColor = task.color ?? COLOR_PALETTE[0].name;
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    color: fallbackColor,
  });

  const handleSave = () =>
    onSave({
      title: form.title,
      priority: form.priority as Priority,
      color: form.color,
      ...(form.description ? { description: form.description } : {}),
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task details below.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <TaskCommonFields form={form} setForm={setForm} />
        </div>

        <DialogFooterButtons onCancel={() => onOpenChange(false)} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  );
}