import type { CSSProperties } from 'react';

interface DropdownPositionArgs {
  triggerRect: DOMRect;
  contentHeight: number;
  align: 'start' | 'center' | 'end';
  sideOffset: number;
  maxHeight?: number;
}

export function computeDropdownPosition({ triggerRect, contentHeight, align, sideOffset, maxHeight = 280 }: DropdownPositionArgs): CSSProperties {
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const placeOnTop = spaceBelow < contentHeight + 8 && triggerRect.top > contentHeight;

  const availableSpace = placeOnTop ? triggerRect.top - 8 : spaceBelow - 8;
  const clampedMaxHeight = Math.min(maxHeight, Math.max(120, availableSpace));

  const style: CSSProperties = {
    position: 'fixed',
    zIndex: 100,
    minWidth: `${triggerRect.width}px`,
    maxHeight: `${clampedMaxHeight}px`,
    overflowY: 'auto',
    overflowX: 'hidden',
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

  return style;
}