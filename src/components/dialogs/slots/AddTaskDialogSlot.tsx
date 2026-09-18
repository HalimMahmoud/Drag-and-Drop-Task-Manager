import type { SlotProps } from './SlotProps';
import { AddTaskDialog } from '../AddTaskDialog';

export function AddTaskDialogSlot({ board, ui }: SlotProps) {
  const employee = ui.addingTaskFor;
  if (!employee) return null;

  const employeeTasks = board.tasks.filter((task) => task.employeeId === employee.id);
  const usedColors = board.tasks.flatMap((task) => (task.color ? [task.color] : []));

  return (
    <AddTaskDialog
      key={employee.id}
      employee={employee}
      tasks={employeeTasks}
      usedColors={usedColors}
      timelineRange={board.timelineRange}
      open
      onOpenChange={(open) => !open && ui.setAddingTaskFor(null)}
      onSave={(data) => board.addTask(employee.id, data)}
    />
  );
}