import * as React from 'react';

interface UseClickOutsideArgs {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function useClickOutside({ open, onOpenChange, triggerRef, contentRef }: UseClickOutsideArgs) {
  React.useEffect(() => {
    if (!open) return;
    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [open, onOpenChange, triggerRef, contentRef]);
}