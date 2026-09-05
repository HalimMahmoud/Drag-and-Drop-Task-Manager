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
  if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
  return ctx;
}

export function DropdownMenu({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);
  const isOpen = open ?? internalOpen;

  const setIsOpen = (value: boolean) => {
    onOpenChange?.(value);
    setInternalOpen(value);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
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
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      ref: triggerRef as unknown as React.Ref<HTMLElement>,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        (children.props as { onClick?: (e: React.MouseEvent<HTMLElement>) => void }).onClick?.(e);
        onOpenChange(!open);
      },
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button ref={(node) => { triggerRef.current = node; }} {...props} onClick={(e) => { props.onClick?.(e); onOpenChange(!open); }}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = 4,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}) {
  const { open, onOpenChange, triggerRef } = useDropdownMenu();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<React.CSSProperties>({});

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentHeight = contentRef.current?.offsetHeight || 100;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const placeOnTop = spaceBelow < contentHeight + 8 && triggerRect.top > contentHeight;

      const style: React.CSSProperties = {
        position: 'fixed',
        zIndex: 100,
      };

      if (placeOnTop) {
        style.bottom = `${window.innerHeight - triggerRect.top + sideOffset}px`;
      } else {
        style.top = `${triggerRect.bottom + sideOffset}px`;
      }

      if (align === 'end') {
        style.right = `${window.innerWidth - triggerRect.right}px`;
      } else if (align === 'center') {
        style.left = `${triggerRect.left + triggerRect.width / 2}px`;
        style.transform = 'translateX(-50%)';
      } else {
        style.left = `${triggerRect.left}px`;
      }

      setPosition(style);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, align, sideOffset, triggerRef]);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [open, onOpenChange, triggerRef]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      className={cn('min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}
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
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
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
  return <div data-slot="dropdown-menu-separator" className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}
