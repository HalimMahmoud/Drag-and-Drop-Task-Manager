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

export interface TimelineRange {
  startHour: number;
  endHour: number;
}

export const DEFAULT_TIMELINE_RANGE: TimelineRange = { startHour: 0, endHour: 12 };
export const MAX_TIMELINE_HOURS = 24;

export interface Task {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  priority: Priority;
  durationHours: number;
  startHour: number;
  color?: ColorPaletteName;
}

export interface TaskDragData {
  type: 'task';
  taskId: string;
  employeeId: string;
  startHour: number;
  durationHours: number;
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
