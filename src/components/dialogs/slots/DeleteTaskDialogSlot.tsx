import type { SlotProps } from './SlotProps';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

export function DeleteTaskDialogSlot({ board, ui }: SlotProps) {
  const task = ui.deletingTask;
  if (!task) return null;

  return (
    <DeleteConfirmDialog
      title="Delete Task"
      description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      open
      onOpenChange={(open) => !open && ui.setDeletingTask(null)}
      onConfirm={() => {
        board.deleteTask(task.id);
        ui.setDeletingTask(null);
      }}
    />
  );
}