import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DialogFooterButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  disabled?: boolean;
  destructive?: boolean;
}

export function DialogFooterButtons({
  onCancel,
  onSave,
  saveLabel = 'Save',
  disabled,
  destructive,
}: DialogFooterButtonsProps) {
  return (
    <DialogFooter>
      <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      <Button variant={destructive ? 'destructive' : 'default'} size="sm" onClick={onSave} disabled={disabled}>
        {saveLabel}
      </Button>
    </DialogFooter>
  );
}