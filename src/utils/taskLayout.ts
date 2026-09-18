import { customAlphabet } from 'nanoid';
import type { Priority, PriorityColorKey, PriorityColors, Task, TimelineRange } from '../types';

export const MIN_TASK_HOURS = 1;
export const taskIdGenerator = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 3);

const TASK_COLOR_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#e11d48',
  '#0ea5e9',
];

export const nextTaskColor = (usedColors: readonly string[]): string => {
  const used = new Set(usedColors);
  const free = TASK_COLOR_PALETTE.find((color) => !used.has(color));
  if (free) return free;
  return TASK_COLOR_PALETTE[used.size % TASK_COLOR_PALETTE.length] ?? TASK_COLOR_PALETTE[0] ?? '#3b82f6';
};

export const isTaskVisibleInRange = (task: Task, range: TimelineRange) =>
  task.startHour >= range.startHour && task.startHour + task.durationHours <= range.endHour;

export const isPositionValid = (startHour: number, durationHours: number, otherTasks: Task[], range: TimelineRange): boolean =>
  Number.isInteger(startHour) &&
  Number.isInteger(durationHours) &&
  startHour >= range.startHour &&
  startHour + durationHours <= range.endHour &&
  !otherTasks.some((task) => startHour < task.startHour + task.durationHours && startHour + durationHours > task.startHour);

export const findNearestValidStartHour = (
  targetStartHour: number,
  durationHours: number,
  otherTasks: Task[],
  range: TimelineRange,
): number | null => {
  const timelineHours = range.endHour - range.startHour;
  if (durationHours > timelineHours) return null;

  const minimumStartHour = range.startHour;
  const maximumStartHour = range.endHour - durationHours;
  const boundedTargetHour = Math.max(minimumStartHour, Math.min(Math.floor(targetStartHour), maximumStartHour));

  for (let delta = 0; delta <= timelineHours; delta++) {
    const leftStartHour = boundedTargetHour - delta;
    if (isPositionValid(leftStartHour, durationHours, otherTasks, range)) return leftStartHour;

    const rightStartHour = boundedTargetHour + delta;
    if (delta > 0 && isPositionValid(rightStartHour, durationHours, otherTasks, range)) return rightStartHour;
  }

  return null;
};

export const snapToHour = (
  clientX: number,
  taskAreaRect: DOMRect,
  dragOffsetX: number,
  durationHours: number,
  range: TimelineRange,
) => {
  const hourWidth = taskAreaRect.width / (range.endHour - range.startHour);
  const rawHour = Math.round((clientX - taskAreaRect.left - dragOffsetX) / hourWidth);
  return Math.max(range.startHour, Math.min(rawHour, range.endHour - durationHours));
};

export const PRIORITY_COLORS: Record<PriorityColorKey, PriorityColors> = {
  high: { bg: '#fff0f0', border: '#c9372c', dim: '#c9372c33' },
  medium: { bg: '#fffbeb', border: '#b45309', dim: '#b4530933' },
  low: { bg: '#f0f9ff', border: '#0c66e4', dim: '#0c66e433' },
};

export const priorityToColorKey = (priority: Priority): PriorityColorKey =>
  priority.toLowerCase() as PriorityColorKey;