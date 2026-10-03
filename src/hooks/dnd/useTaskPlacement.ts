import { useEffect, useRef, useState, type RefObject } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { isTask, type Task, type TimelineRange } from '../../types';
import { resolveTaskDropStartSlot } from '../../utils/dnd';

interface DataArgs {
  source: { data: Record<string, unknown> };
  self: { data: Record<string, unknown> };
}

const createTaskDropResolver =
  (employeeId: string, getTasks: () => Task[], timelineRange: TimelineRange) =>
  (input: { clientX: number }, source: { data: Record<string, unknown> }, element: Element) =>
    resolveTaskDropStartSlot({ input, source, element, employeeId, tasks: getTasks(), timelineRange });

const onTaskEnter = (setTaskOver: (v: boolean) => void, setIndicator: (v: number | null) => void) => ({ self }: DataArgs) => {
  setTaskOver(true);
  setIndicator(resolveDropSlot(self.data));
};

const onTaskDrag = (setIndicator: (v: number | null) => void) => ({ self }: DataArgs) => {
  setIndicator(resolveDropSlot(self.data));
};

const onTaskDrop = (
  employeeId: string,
  onPlaceTask: (taskId: string, employeeId: string, startSlot: number) => void,
  reset: () => void,
) => ({ source, self }: DataArgs) => {
  reset();
  const targetStartSlot = resolveDropSlot(self.data);
  if (isTask(source.data) && typeof targetStartSlot === 'number') {
    onPlaceTask(source.data.taskId, employeeId, targetStartSlot);
  }
};

export function useTaskPlacement(
  taskAreaRef: RefObject<HTMLDivElement | null>,
  employeeId: string,
  timelineRange: TimelineRange,
  tasks: Task[],
  onPlaceTask: (taskId: string, employeeId: string, startSlot: number) => void,
  supervisorMode: boolean,
) {
  const [taskOver, setTaskOver] = useState(false);
  const [dropIndicatorSlot, setDropIndicatorSlot] = useState<number | null>(null);
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  const reset = () => {
    setTaskOver(false);
    setDropIndicatorSlot(null);
  };

  useEffect(() => {
    if (!supervisorMode) return;
    const element = taskAreaRef.current;
    if (!element) return;

    const resolveStartSlot = createTaskDropResolver(employeeId, () => tasksRef.current, timelineRange);

    return dropTargetForElements({
      element,
      getDropEffect: () => 'move',
      canDrop: ({ input, source, element }) => resolveStartSlot(input, source, element) !== null,
      getData: ({ input, source, element }) => ({
        type: 'task-area' as const,
        employeeId,
        targetStartSlot: resolveStartSlot(input, source, element),
      }),
      onDragEnter: onTaskEnter(setTaskOver, setDropIndicatorSlot),
      onDrag: onTaskDrag(setDropIndicatorSlot),
      onDragLeave: reset,
      onDrop: onTaskDrop(employeeId, onPlaceTask, reset),
    });
  }, [taskAreaRef, employeeId, onPlaceTask, supervisorMode, timelineRange]);

  return { taskOver, dropIndicatorSlot };
}

const resolveDropSlot = (data: Record<string, unknown>) => {
  const slot = data['targetStartSlot'];
  return typeof slot === 'number' ? slot : null;
};