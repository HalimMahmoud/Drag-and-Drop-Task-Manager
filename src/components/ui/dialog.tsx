import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialog() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog components must be used within <Dialog>');
  }
  return ctx;
}

interface TriggerChildProps {
  onClick?: (e: React.MouseEvent) => void;
}

function Dialog({
  open,
  onOpenChange,
  children,
}: DialogContextValue & { children: React.ReactNode }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  children,
  asChild = false,
  ...props
}: React.ComponentPropsWithoutRef<'button'> & { asChild?: boolean }) {
  const { onOpenChange } = useDialog();
  const handleClick = () => onOpenChange(true);

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<TriggerChildProps>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        handleClick();
      },
    });
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { showClose?: boolean }) {
  const { open, onOpenChange } = useDialog();

  if (typeof document === 'undefined' || !open) return null;

  return createPortal(
    <div data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)}>
      <div
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 grid w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          data-slot="dialog-content"
          className={cn(
            'relative flex flex-col gap-4 border bg-popover p-6 shadow-lg',
            'sm:max-w-lg sm:rounded-lg',
            className
          )}
          {...props}
        >
          {children}
          <button
            data-slot="dialog-close"
            className={cn(
              'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100'
            )}
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex justify-end gap-2', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
