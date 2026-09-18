import { useEffect, useState, type RefObject } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { isRow } from '../../types';

interface RowDragArgs {
  source: { data: Record<string, unknown> };
  self: { data: Record<string, unknown> };
}

const onRowEnter = (setRowOver: (v: boolean) => void, setRowEdge: (e: Edge | null) => void) => ({ source, self }: RowDragArgs) => {
  if (!isRow(source.data)) return;
  setRowOver(true);
  setRowEdge(extractClosestEdge(self.data));
};

const onRowDrag = (setRowEdge: (e: Edge | null) => void) => ({ source, self }: RowDragArgs) => {
  if (isRow(source.data)) setRowEdge(extractClosestEdge(self.data));
};

const onRowDrop = (
  employeeId: string,
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void,
  reset: () => void,
) => ({ source, self }: RowDragArgs) => {
  reset();
  if (isRow(source.data)) onReorderRow(source.data.employeeId, employeeId, extractClosestEdge(self.data));
};

export function useRowReorder(
  rowRef: RefObject<HTMLDivElement | null>,
  employeeId: string,
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void,
  supervisorMode: boolean,
) {
  const [rowOver, setRowOver] = useState(false);
  const [rowEdge, setRowEdge] = useState<Edge | null>(null);
  const reset = () => {
    setRowOver(false);
    setRowEdge(null);
  };

  useEffect(() => {
    if (!supervisorMode) return;
    const element = rowRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => isRow(source.data),
      getData: ({ input, element }) =>
        attachClosestEdge({ type: 'row', employeeId }, { input, element, allowedEdges: ['top', 'bottom'] }),
      onDragEnter: onRowEnter(setRowOver, setRowEdge),
      onDrag: onRowDrag(setRowEdge),
      onDragLeave: reset,
      onDrop: onRowDrop(employeeId, onReorderRow, reset),
    });
  }, [rowRef, employeeId, onReorderRow, supervisorMode]);

  return { rowOver, rowEdge };
}