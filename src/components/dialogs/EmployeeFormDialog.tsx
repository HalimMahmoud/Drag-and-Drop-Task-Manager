import { useState, type ReactNode } from 'react';
import type { ColorPaletteName } from '../../types';
import { DialogShell } from './DialogShell';
import { EmployeeCommonFields } from './EmployeeCommonFields';

interface EmployeeDraft {
  name: string;
  role: string;
  color: ColorPaletteName;
}

interface EmployeeFormDialogProps {
  trigger?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  saveLabel: string;
  initialValues: EmployeeDraft;
  onSave: (draft: EmployeeDraft) => void;
  autoFocus?: boolean;
}

export function EmployeeFormDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  saveLabel,
  initialValues,
  onSave,
  autoFocus,
}: EmployeeFormDialogProps) {
  const [form, setForm] = useState(initialValues);
  const isValid = form.name.trim().length > 0;

  return (
    <DialogShell
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      saveLabel={saveLabel}
      onSave={() => onSave(form)}
      disabled={!isValid}
    >
      <div className="grid gap-4 py-4">
        <EmployeeCommonFields form={form} setForm={setForm} autoFocus={autoFocus ?? false} />
      </div>
    </DialogShell>
  );
}