export type Priority = 'Low' | 'Medium' | 'High';
export type PriorityColorKey = Lowercase<Priority>;

export type ColorPaletteName = 
  | 'red' | 'rose' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald'
  | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia'
  | 'pink' | 'slate' | 'gray' | 'zinc' | 'stone' | 'coral' | 'mint' | 'lavender' | 'gold';

export interface PriorityColors {
  bg: string;
  border: string;
  dim: string;
}

export interface ColorVariant {
  name: string;
  light: {
    bg: string;
    border: string;
    dim: string;
    text: string;
  };
  dark: {
    bg: string;
    border: string;
    dim: string;
    text: string;
  };
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  color?: ColorPaletteName;
}

/** Granularity of a board's timeline. A "slot" means one unit of the chosen plan. */
export type TimeUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years';

/**
 * The visible window, expressed in slots. What a slot means depends on the
 * board's {@link TimeUnit}: 1 slot == 1 hour, 1 day, 1 week, 1 month or 1 year.
 *
 * Both bounds are user-adjustable and default to the whole plan (0 through the unit's
 * capacity: 24 hours, 31 days, 52 weeks, 12 months, 6 years). `endSlot` is exclusive,
 * so the visible width is `endSlot - startSlot` slots.
 * {@link isValidTimelineRange} enforces the bounds and {@link clampTimelineRange}
 * brings an arbitrary range in line.
 */
export interface TimelineRange {
  /** First visible slot, within the unit's capacity. */
  startSlot: number;
  /** Exclusive end of the window. */
  endSlot: number;
}

/** A {@link TimelineRange} plus the unit that gives its slots meaning. */
export interface TimelineConfig extends TimelineRange {
  unit: TimeUnit;
}

export const DEFAULT_TIME_UNIT: TimeUnit = 'hours';
export const DEFAULT_TIMELINE_RANGE: TimelineRange = { startSlot: 0, endSlot: 24 };
export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  unit: DEFAULT_TIME_UNIT,
  ...DEFAULT_TIMELINE_RANGE,
};

export interface Task {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  priority: Priority;
  /** Number of slots the task spans. */
  durationSlot: number;
  /** Slot index the task starts at. */
  startSlot: number;
  color?: ColorPaletteName;
}

export interface TaskDragData {
  type: 'task';
  taskId: string;
  employeeId: string;
  startSlot: number;
  durationSlot: number;
  dragOffsetX: number;
}

export interface RowDragData {
  type: 'row';
  employeeId: string;
}

export type DragData = TaskDragData | RowDragData;

export function isTask(data: object): data is TaskDragData {
  return 'type' in data && data.type === 'task';
}

export function isRow(data: object): data is RowDragData {
  return 'type' in data && data.type === 'row';
}
