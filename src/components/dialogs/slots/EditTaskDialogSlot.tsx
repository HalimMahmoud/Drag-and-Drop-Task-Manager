import type { SlotProps } from './SlotProps';
import { EditTaskDialog } from '../EditTaskDialog';

export function EditTaskDialogSlot({ board, ui }: SlotProps) {
  const task = ui.editingTask;
  if (!task) return null;

  return (
    <EditTaskDialog
      key={task.id}
      task={task}
      open
      onOpenChange={(open) => !open && ui.setEditingTask(null)}
      onSave={(updates) => {
        board.updateTask(task.id, updates);
        ui.setEditingTask(null);
      }}
    />
  );
}