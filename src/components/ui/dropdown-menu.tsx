import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useDropdownPosition } from './useDropdownPosition';
import { useClickOutside } from './useClickOutside';

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

function useDropdownMenu() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  return ctx;
}

interface TriggerChildProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}

export function DropdownMenu({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const isOpen = open ?? internalOpen;

  const setIsOpen = (value: boolean) => {
    onOpenChange?.(value);
    setInternalOpen(value);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }: React.ComponentPropsWithoutRef<'button'> & { asChild?: boolean }) {
  const { open, onOpenChange, triggerRef } = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<TriggerChildProps>, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        const childProps = children.props as { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void };
        childProps.onClick?.(e);
        onOpenChange(!open);
      },
    });
  }

  return (
    <button
      ref={(node) => { triggerRef.current = node; }}
      {...props}
      onClick={(e) => { props.onClick?.(e); onOpenChange(!open); }}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = 4,
  maxHeight = 280,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  maxHeight?: number;
}) {
  const { open, onOpenChange, triggerRef } = useDropdownMenu();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const position = useDropdownPosition({ open, align, sideOffset, triggerRef, contentRef, maxHeight });
  useClickOutside({ open, onOpenChange, triggerRef, contentRef });

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'z-100 min-w-36 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-150',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100',
        'max-h-[280px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent',
        className,
      )}
      style={position}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DropdownMenuItem({ className, inset, onSelect, children, ...props }: React.ComponentPropsWithoutRef<'div'> & { inset?: boolean; onSelect?: () => void }) {
  const { onOpenChange } = useDropdownMenu();

  return (
    <div
      data-slot="dropdown-menu-item"
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm',
        'px-2 py-1.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:bg-accent focus-visible:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        'transition-colors duration-100',
        inset && 'pl-8',
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick?.(e);
        onSelect?.();
        onOpenChange(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  );
}
