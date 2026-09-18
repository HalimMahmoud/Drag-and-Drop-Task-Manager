import type { SlotProps } from './SlotProps';
import { AddEmployeeDialog } from '../AddEmployeeDialog';

export function AddEmployeeDialogSlot({ board, ui }: SlotProps) {
  if (!ui.addingEmployee) return null;

  return <AddEmployeeDialog open onOpenChange={ui.setAddingEmployee} onSave={(data) => board.addEmployee(data)} />;
}