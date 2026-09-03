import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

function useDropdownMenu() {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  }
  return ctx;
}

function DropdownMenu({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);

  const isOpen = open ?? internalOpen;
  const setIsOpen = (value: boolean) => {
    onOpenChange?.(value);
    setInternalOpen(value);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

interface DropdownTriggerChildProps {
  onClick?: (e: React.MouseEvent) => void;
  ref?: React.RefObject<HTMLElement | null>;
}

function DropdownMenuTrigger({
  children,
  asChild = false,
  ...props
}: React.ComponentPropsWithoutRef<'button'> & { asChild?: boolean }) {
  const { open, onOpenChange, triggerRef } = useDropdownMenu();

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<DropdownTriggerChildProps>;
    return React.cloneElement(child, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        onOpenChange(!open);
      },
    });
  }

  return (
    <button
      ref={(node) => {
        triggerRef.current = node;
      }}
      {...props}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(e);
        onOpenChange(!open);
      }}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = 4,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}) {
  const { open, triggerRef } = useDropdownMenu();
  const contentRef = React.useRef<HTMLDivElement>(null);

  if (!open || typeof document === 'undefined') return null;

  let placement = 'top-0';

  const triggerRect = triggerRef.current?.getBoundingClientRect();
  if (triggerRect) {
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    placement = spaceBelow >= spaceAbove ? 'top-full' : 'bottom-full';
  }

  return createPortal(
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      className={cn(
        'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className
      )}
      style={{
        position: 'fixed',
        ...(triggerRect ? { top: placement === 'top-full' ? triggerRect.bottom + sideOffset : triggerRect.top - sideOffset } : { top: 0 }),
        ...(triggerRect ? { left: align === 'end' ? triggerRect.right : align === 'center' ? triggerRect.left + triggerRect.width / 2 : triggerRect.left } : {}),
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

function DropdownMenuItem({
  className,
  inset,
  onSelect,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  inset?: boolean;
  onSelect?: () => void;
}) {
  const ctx = useDropdownMenu();

  return (
    <div
      data-slot="dropdown-menu-item"
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        inset && 'pl-8',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick?.(e);
        onSelect?.();
        ctx.onOpenChange(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
