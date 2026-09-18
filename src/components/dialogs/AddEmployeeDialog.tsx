import type { ReactNode } from 'react';
import type { Employee, ColorPaletteName } from '../../types';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { getNextAvailableColorName } from '../../utils/colorPalette';

interface AddEmployeeDialogProps {
  trigger?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Omit<Employee, 'id'>) => void;
}

export function AddEmployeeDialog({ trigger, open, onOpenChange, onSave }: AddEmployeeDialogProps) {
  return (
    <EmployeeFormDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Employee"
      description="Create a new employee row on the board."
      saveLabel="Add Employee"
      initialValues={{ name: '', role: '', color: getNextAvailableColorName([]) }}
      autoFocus
      onSave={(form) => onSave({ name: form.name.trim(), role: form.role.trim(), color: form.color })}
    />
  );
}