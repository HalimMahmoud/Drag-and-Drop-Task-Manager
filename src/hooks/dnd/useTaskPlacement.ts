import { useEffect, useRef, useState, type RefObject } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { isTask, type Task, type TimelineRange } from '../../types';
import { resolveTaskDropStartHour } from '../../utils/dnd';

interface DataArgs {
  source: { data: Record<string, unknown> };
  self: { data: Record<string, unknown> };
}

const createTaskDropResolver =
  (employeeId: string, getTasks: () => Task[], timelineRange: TimelineRange) =>
  (input: { clientX: number }, source: { data: Record<string, unknown> }, element: Element) =>
    resolveTaskDropStartHour({ input, source, element, employeeId, tasks: getTasks(), timelineRange });

const onTaskEnter = (setTaskOver: (v: boolean) => void, setIndicator: (v: number | null) => void) => ({ self }: DataArgs) => {
  setTaskOver(true);
  setIndicator(resolveDropHour(self.data));
};

const onTaskDrag = (setIndicator: (v: number | null) => void) => ({ self }: DataArgs) => {
  setIndicator(resolveDropHour(self.data));
};

const onTaskDrop = (
  employeeId: string,
  onPlaceTask: (taskId: string, employeeId: string, startHour: number) => void,
  reset: () => void,
) => ({ source, self }: DataArgs) => {
  reset();
  const targetStartHour = resolveDropHour(self.data);
  if (isTask(source.data) && typeof targetStartHour === 'number') {
    onPlaceTask(source.data.taskId, employeeId, targetStartHour);
  }
};

export function useTaskPlacement(
  taskAreaRef: RefObject<HTMLDivElement | null>,
  employeeId: string,
  timelineRange: TimelineRange,
  tasks: Task[],
  onPlaceTask: (taskId: string, employeeId: string, startHour: number) => void,
  supervisorMode: boolean,
) {
  const [taskOver, setTaskOver] = useState(false);
  const [dropIndicatorHour, setDropIndicatorHour] = useState<number | null>(null);
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  const reset = () => {
    setTaskOver(false);
    setDropIndicatorHour(null);
  };

  useEffect(() => {
    if (!supervisorMode) return;
    const element = taskAreaRef.current;
    if (!element) return;

    const resolveStartHour = createTaskDropResolver(employeeId, () => tasksRef.current, timelineRange);

    return dropTargetForElements({
      element,
      getDropEffect: () => 'move',
      canDrop: ({ input, source, element }) => resolveStartHour(input, source, element) !== null,
      getData: ({ input, source, element }) => ({
        type: 'task-area' as const,
        employeeId,
        targetStartHour: resolveStartHour(input, source, element),
      }),
      onDragEnter: onTaskEnter(setTaskOver, setDropIndicatorHour),
      onDrag: onTaskDrag(setDropIndicatorHour),
      onDragLeave: reset,
      onDrop: onTaskDrop(employeeId, onPlaceTask, reset),
    });
  }, [taskAreaRef, employeeId, onPlaceTask, supervisorMode, timelineRange]);

  return { taskOver, dropIndicatorHour };
}

const resolveDropHour = (data: Record<string, unknown>) => {
  const hour = data['targetStartHour'];
  return typeof hour === 'number' ? hour : null;
};