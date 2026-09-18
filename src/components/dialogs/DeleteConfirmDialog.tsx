import type { ReactNode } from 'react';
import { DialogShell } from './DialogShell';

interface DeleteConfirmDialogProps {
  trigger?: ReactNode;
  title?: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  trigger,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <DialogShell
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      saveLabel="Delete"
      onSave={onConfirm}
      destructive
    />
  );
}