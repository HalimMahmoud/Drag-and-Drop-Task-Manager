import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

function useSelect() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error('Select components must be used within <Select>');
  return ctx;
}

export function Select({ value, onValueChange, children, ...props }: React.ComponentPropsWithoutRef<'div'> & { value?: string; onValueChange?: (val: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange: setOpen, triggerRef }}>
      <div data-slot="select" {...props}>{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<'button'>) {
  const { open, onOpenChange, triggerRef } = useSelect();

  return (
    <button
      ref={triggerRef}
      data-slot="select-trigger"
      type="button"
      className={cn('flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)}
      onClick={() => onOpenChange(!open)}
      {...props}
    >
      {children}
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder, ...props }: React.ComponentPropsWithoutRef<'span'> & { placeholder?: string }) {
  const { value } = useSelect();
  return <span data-slot="select-value" className="truncate" {...props}>{value || placeholder}</span>;
}

export function SelectContent({ className, children, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const { open, triggerRef } = useSelect();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = contentRef.current.offsetHeight || 200;
    const isTop = window.innerHeight - rect.bottom < dropdownHeight + 8;
    const top = isTop ? rect.top - dropdownHeight - 4 : rect.bottom + 4;

    Object.assign(contentRef.current.style, {
      position: 'fixed',
      top: `${top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      minWidth: `${rect.width}px`,
      zIndex: '9999',
    });
  }, [open, triggerRef]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div data-slot="select-content" ref={contentRef} className={cn('relative z-50 min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)} {...props}>
      {children}
    </div>,
    document.body,
  );
}

export function SelectItem({ className, children, value, ...props }: React.ComponentPropsWithoutRef<'div'> & { value: string }) {
  const { onValueChange, onOpenChange } = useSelect();

  return (
    <div
      data-slot="select-item"
      data-value={value}
      className={cn('relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className)}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick?.(e);
        onValueChange?.(value);
        onOpenChange(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectLabel({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div data-slot="select-label" className={cn('py-1.5 pl-2 text-xs font-semibold', className)} {...props} />;
}

export function SelectSeparator({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div data-slot="select-separator" className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}
