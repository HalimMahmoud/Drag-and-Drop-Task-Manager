import { useRef } from 'react';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { Task, TimelineRange } from '../../types';
import { useRowDraggable } from './useRowDraggable';
import { useRowReorder } from './useRowReorder';
import { useTaskPlacement } from './useTaskPlacement';

interface UseEmployeeRowDndOptions {
  employeeId: string;
  supervisorMode: boolean;
  timelineRange: TimelineRange;
  tasks: Task[];
  onPlaceTask: (taskId: string, employeeId: string, startHour: number) => void;
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void;
}

export function useEmployeeRowDnd({
  employeeId,
  supervisorMode,
  timelineRange,
  tasks,
  onPlaceTask,
  onReorderRow,
}: UseEmployeeRowDndOptions) {
  const rowRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const taskAreaRef = useRef<HTMLDivElement>(null);

  useRowDraggable(rowRef, dragHandleRef, employeeId, supervisorMode);
  const { rowOver, rowEdge } = useRowReorder(rowRef, employeeId, onReorderRow, supervisorMode);
  const { taskOver, dropIndicatorHour } = useTaskPlacement(taskAreaRef, employeeId, timelineRange, tasks, onPlaceTask, supervisorMode);

  return { rowRef, dragHandleRef, taskAreaRef, isRowOver: rowOver || taskOver, rowEdge, dropIndicatorHour };
}