import type { ReactNode } from 'react';
import type { Employee, ColorPaletteName } from '../../types';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { getNextAvailableColorName, COLOR_PALETTE } from '../../utils/colorPalette';

interface EditEmployeeDialogProps {
  trigger?: ReactNode;
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Omit<Employee, 'id'>>) => void;
}

export function EditEmployeeDialog({ trigger, employee, open, onOpenChange, onSave }: EditEmployeeDialogProps) {
  const fallbackColor = employee.color ?? COLOR_PALETTE[0].name;
  return (
    <EmployeeFormDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Employee"
      description="Update employee details below."
      saveLabel="Save"
      initialValues={{ name: employee.name, role: employee.role, color: fallbackColor }}
      onSave={(form) => onSave(form)}
    />
  );
}