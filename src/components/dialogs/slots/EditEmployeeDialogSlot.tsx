import type { SlotProps } from './SlotProps';
import { EditEmployeeDialog } from '../EditEmployeeDialog';

export function EditEmployeeDialogSlot({ board, ui }: SlotProps) {
  const employee = ui.editingEmployee;
  if (!employee) return null;

  return (
    <EditEmployeeDialog
      key={employee.id}
      employee={employee}
      open
      onOpenChange={(open) => !open && ui.setEditingEmployee(null)}
      onSave={(updates) => {
        board.updateEmployee(employee.id, updates);
        ui.setEditingEmployee(null);
      }}
    />
  );
}