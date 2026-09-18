import type { SlotProps } from './SlotProps';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

export function DeleteEmployeeDialogSlot({ board, ui }: SlotProps) {
  const employee = ui.deletingEmployee;
  if (!employee) return null;

  return (
    <DeleteConfirmDialog
      title="Delete Employee"
      description={`Are you sure you want to delete "${employee.name}"? This action will also remove all their tasks. This action cannot be undone.`}
      open
      onOpenChange={(open) => !open && ui.setDeletingEmployee(null)}
      onConfirm={() => {
        board.deleteEmployee(employee.id);
        ui.setDeletingEmployee(null);
      }}
    />
  );
}