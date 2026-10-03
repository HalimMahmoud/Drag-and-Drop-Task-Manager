import { useEffect, useState, type RefObject } from 'react';

/**
 * Width of a single timeline slot in pixels. Falls back to a minimum so narrow
 * slots stay visible on coarse units (weeks, months, years) even on small screens.
 */
export function useTimelineWidth(boardRef: RefObject<HTMLDivElement | null>, timelineSlots: number) {
  const [slotWidth, setSlotWidth] = useState(100);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const updateSlotWidth = (width: number) => {
      setSlotWidth(Math.max(4, (width - 230) / Math.max(timelineSlots, 1)));
    };

    updateSlotWidth(board.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateSlotWidth(entry.contentRect.width);
    });
    observer.observe(board);
    return () => observer.disconnect();
  }, [boardRef, timelineSlots]);

  return slotWidth;
}