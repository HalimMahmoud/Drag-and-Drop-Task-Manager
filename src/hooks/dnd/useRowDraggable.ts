import { useEffect, type RefObject } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { DragData } from '../../types';

export function useRowDraggable(
  rowRef: RefObject<HTMLDivElement | null>,
  dragHandleRef: RefObject<HTMLDivElement | null>,
  employeeId: string,
  supervisorMode: boolean,
) {
  useEffect(() => {
    if (!supervisorMode) return;
    const element = rowRef.current;
    if (!element) return;

    return draggable({
      element,
      ...(dragHandleRef.current ? { dragHandle: dragHandleRef.current } : {}),
      getInitialData: () => ({ type: 'row', employeeId } satisfies DragData),
    });
  }, [rowRef, dragHandleRef, employeeId, supervisorMode]);
}