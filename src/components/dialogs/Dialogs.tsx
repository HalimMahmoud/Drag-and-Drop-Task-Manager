import type { SlotProps } from './slots/SlotProps';
import { EditTaskDialogSlot } from './slots/EditTaskDialogSlot';
import { AddTaskDialogSlot } from './slots/AddTaskDialogSlot';
import { AddEmployeeDialogSlot } from './slots/AddEmployeeDialogSlot';
import { EditEmployeeDialogSlot } from './slots/EditEmployeeDialogSlot';
import { DeleteTaskDialogSlot } from './slots/DeleteTaskDialogSlot';
import { DeleteEmployeeDialogSlot } from './slots/DeleteEmployeeDialogSlot';

interface DialogsProps {
  board: SlotProps['board'];
  ui: SlotProps['ui'];
}

export function Dialogs({ board, ui }: DialogsProps) {
  return (
    <>
      <AddTaskDialogSlot board={board} ui={ui} />
      <EditTaskDialogSlot board={board} ui={ui} />
      <AddEmployeeDialogSlot board={board} ui={ui} />
      <EditEmployeeDialogSlot board={board} ui={ui} />
      <DeleteTaskDialogSlot board={board} ui={ui} />
      <DeleteEmployeeDialogSlot board={board} ui={ui} />
    </>
  );
}