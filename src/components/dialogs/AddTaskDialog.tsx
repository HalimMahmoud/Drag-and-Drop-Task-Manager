import type { ReactNode } from 'react';
import type { Employee, Task, TimelineRange, ColorPaletteName } from '../../types';
import { useAddTaskForm } from '../../hooks/form/useAddTaskForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogFooterButtons } from './DialogFooterButtons';
import { TaskCommonFields } from './TaskCommonFields';
import { TaskScheduleFields } from './TaskScheduleFields';

interface AddTaskDialogProps {
  trigger?: ReactNode;
  employee: Employee;
  tasks: Task[];
  usedColors: ColorPaletteName[];
  timelineRange: TimelineRange;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Omit<Task, 'id' | 'employeeId'>) => boolean;
}

export function AddTaskDialog({ trigger, employee, tasks, usedColors, timelineRange, open, onOpenChange, onSave }: AddTaskDialogProps) {
  const form = useAddTaskForm({ tasks, usedColors, timelineRange, onSave });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Create a task for {employee.name}.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <TaskCommonFields form={form.form} setForm={form.setForm} autoFocus />
          <TaskScheduleFields form={form.form} setForm={form.setForm} timelineRange={timelineRange} />
        </div>

        <DialogFooterButtons
          onCancel={() => onOpenChange(false)}
          onSave={() => {
            if (form.handleSave()) onOpenChange(false);
          }}
          saveLabel="Add Task"
          disabled={!form.isValid}
        />
      </DialogContent>
    </Dialog>
  );
}