import { isTask, type Task, type TimelineRange } from '../types';
import { findNearestValidStartSlot, snapToSlot } from './taskLayout';

export function resolveTaskDropStartSlot({
  input, source, element, employeeId, tasks, timelineRange,
}: {
  input: { clientX: number };
  source: { data: Record<string, unknown> };
  element: Element;
  employeeId: string;
  tasks: Task[];
  timelineRange: TimelineRange;
}): number | null {
  const { data } = source;
  if (!isTask(data)) return null;
  const rawSlot = snapToSlot(input.clientX, element.getBoundingClientRect(), data.dragOffsetX, data.durationSlot, timelineRange);
  const otherTasks = tasks.filter((t) => t.employeeId === employeeId && t.id !== data.taskId);
  return findNearestValidStartSlot(rawSlot, data.durationSlot, otherTasks, timelineRange);
}