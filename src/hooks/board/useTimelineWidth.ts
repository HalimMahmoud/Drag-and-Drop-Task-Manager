import { useEffect, useState, type RefObject } from 'react';

export function useTimelineWidth(boardRef: RefObject<HTMLDivElement | null>, timelineHours: number) {
  const [hourWidth, setHourWidth] = useState(100);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const updateHourWidth = (width: number) => {
      setHourWidth(Math.max(10, (width - 230) / timelineHours));
    };

    updateHourWidth(board.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateHourWidth(entry.contentRect.width);
    });
    observer.observe(board);
    return () => observer.disconnect();
  }, [boardRef, timelineHours]);

  return hourWidth;
}