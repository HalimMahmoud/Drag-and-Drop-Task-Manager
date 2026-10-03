import { customAlphabet } from 'nanoid';
import type { Priority, PriorityColorKey, PriorityColors, Task, TimelineRange } from '../types';

export const MIN_TASK_SLOTS = 1;
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
  task.startSlot >= range.startSlot && task.startSlot + task.durationSlot <= range.endSlot;

export const isPositionValid = (startSlot: number, durationSlot: number, otherTasks: Task[], range: TimelineRange): boolean =>
  Number.isInteger(startSlot) &&
  Number.isInteger(durationSlot) &&
  startSlot >= range.startSlot &&
  startSlot + durationSlot <= range.endSlot &&
  !otherTasks.some((task) => startSlot < task.startSlot + task.durationSlot && startSlot + durationSlot > task.startSlot);

export const findNearestValidStartSlot = (
  targetStartSlot: number,
  durationSlot: number,
  otherTasks: Task[],
  range: TimelineRange,
): number | null => {
  const timelineSlots = range.endSlot - range.startSlot;
  if (durationSlot > timelineSlots) return null;

  const minimumStartSlot = range.startSlot;
  const maximumStartSlot = range.endSlot - durationSlot;
  const boundedTargetSlot = Math.max(minimumStartSlot, Math.min(Math.floor(targetStartSlot), maximumStartSlot));

  for (let delta = 0; delta <= timelineSlots; delta++) {
    const leftStartSlot = boundedTargetSlot - delta;
    if (isPositionValid(leftStartSlot, durationSlot, otherTasks, range)) return leftStartSlot;

    const rightStartSlot = boundedTargetSlot + delta;
    if (delta > 0 && isPositionValid(rightStartSlot, durationSlot, otherTasks, range)) return rightStartSlot;
  }

  return null;
};

export const snapToSlot = (
  clientX: number,
  taskAreaRect: DOMRect,
  dragOffsetX: number,
  durationSlot: number,
  range: TimelineRange,
) => {
  const slotWidth = taskAreaRect.width / (range.endSlot - range.startSlot);
  const rawSlot = Math.round((clientX - taskAreaRect.left - dragOffsetX) / slotWidth);
  return Math.max(range.startSlot, Math.min(rawSlot, range.endSlot - durationSlot));
};

export const PRIORITY_COLORS: Record<PriorityColorKey, PriorityColors> = {
  high: { bg: '#fff0f0', border: '#c9372c', dim: '#c9372c33' },
  medium: { bg: '#fffbeb', border: '#b45309', dim: '#b4530933' },
  low: { bg: '#f0f9ff', border: '#0c66e4', dim: '#0c66e433' },
};

export const priorityToColorKey = (priority: Priority): PriorityColorKey =>
  priority.toLowerCase() as PriorityColorKey;