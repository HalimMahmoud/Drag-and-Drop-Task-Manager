import { isTask, type Task, type TimelineRange } from '../types';
import { findNearestValidStartHour, snapToHour } from './taskLayout';

export function resolveTaskDropStartHour({
  input,
  source,
  element,
  employeeId,
  tasks,
  timelineRange,
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
  const rawHour = snapToHour(input.clientX, element.getBoundingClientRect(), data.dragOffsetX, data.durationHours, timelineRange);
  const otherTasks = tasks.filter((t) => t.employeeId === employeeId && t.id !== data.taskId);
  return findNearestValidStartHour(rawHour, data.durationHours, otherTasks, timelineRange);
}