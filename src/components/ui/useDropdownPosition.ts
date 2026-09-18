import * as React from 'react';
import { computeDropdownPosition } from './computeDropdownPosition';

interface UseDropdownPositionArgs {
  open: boolean;
  align: 'start' | 'center' | 'end';
  sideOffset: number;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  maxHeight?: number;
}

export function useDropdownPosition({ open, align, sideOffset, triggerRef, contentRef, maxHeight = 280 }: UseDropdownPositionArgs) {
  const [position, setPosition] = React.useState<React.CSSProperties>({});

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const contentHeight = contentRef.current?.offsetHeight ?? 100;
      setPosition(
        computeDropdownPosition({
          triggerRect: triggerRef.current.getBoundingClientRect(),
          contentHeight,
          align,
          sideOffset,
          maxHeight,
        }),
      );
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, align, sideOffset, triggerRef, contentRef, maxHeight]);

  return position;
}