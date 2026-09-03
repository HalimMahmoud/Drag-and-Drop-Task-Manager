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
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

function useSelect() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error('Select components must be used within <Select>');
  }
  return ctx;
}

function Select({
  value,
  onValueChange,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange: setOpen }}>
      <div data-slot="select" {...props}>{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<'button'>) {
  const { open, onOpenChange } = useSelect();

  return (
    <button
      data-slot="select-trigger"
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm',
        'placeholder:text-muted-foreground focus-visible:outline-none',
        'focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed',
        'disabled:opacity-50',
        className
      )}
      onClick={() => onOpenChange(!open)}
      type="button"
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
    </button>
  );
}

function SelectValue({ placeholder, ...props }: React.ComponentPropsWithoutRef<'span'> & { placeholder?: string }) {
  const { value } = useSelect();
  return (
    <span data-slot="select-value" className="truncate" {...props}>
      {value || placeholder}
    </span>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  position?: 'popper' | 'item-horizontal' | 'item-vertical';
}) {
  const { open } = useSelect();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;

    if (position === 'popper') {
      const rect = triggerEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = contentRef.current?.offsetHeight ?? 200;
      const top = spaceBelow < dropdownHeight + 8 ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
      if (contentRef.current) {
        contentRef.current.style.position = 'fixed';
        contentRef.current.style.top = `${top}px`;
        contentRef.current.style.left = `${rect.left}px`;
        contentRef.current.style.width = `${rect.width}px`;
        contentRef.current.style.minWidth = `${rect.width}px`;
        contentRef.current.style.zIndex = '9999';
      }
    }
  }, [open, position]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-slot="select-content"
      ref={contentRef}
      className={cn(
        'relative z-50 min-w-32 bg-popover text-popover-foreground',
        'border shadow-md rounded-md p-1',
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { value: string }) {
  const { onValueChange, onOpenChange } = useSelect();

  return (
    <div
      data-slot="select-item"
      data-value={value}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:bg-accent focus-visible:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
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

function SelectLabel({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="select-label"
      className={cn('py-1.5 pl-2 text-xs font-semibold', className)}
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="select-separator"
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
