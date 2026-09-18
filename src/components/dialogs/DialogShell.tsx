import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogFooterButtons } from './DialogFooterButtons';

interface DialogShellProps {
  trigger?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  saveLabel: string;
  onSave: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children?: ReactNode;
}

export function DialogShell({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  saveLabel,
  onSave,
  disabled,
  destructive,
  children,
}: DialogShellProps) {
  const handleSave = () => {
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooterButtons
          onCancel={() => onOpenChange(false)}
          onSave={handleSave}
          saveLabel={saveLabel}
          disabled={disabled ?? false}
          destructive={destructive ?? false}
        />
      </DialogContent>
    </Dialog>
  );
}