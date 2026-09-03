export type Priority = 'Low' | 'Medium' | 'High';
export type PriorityColorKey = Lowercase<Priority>;

export interface PriorityColors {
  bg: string;
  border: string;
  dim: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  color?: string;
}

export interface Task {
  id: string;
  employeeId: string;
  title: string;
  description?: string;
  priority: Priority;
  durationHours: number;
  startHour: number;
  color?: string;
}

export type DragData =
  | {
      type: 'task';
      taskId: string;
      employeeId: string;
      startHour: number;
      durationHours: number;
      dragOffsetX: number;
    }
  | { type: 'row'; employeeId: string };

export const isTask = (v: unknown): v is DragData & { type: 'task' } =>
  typeof v === 'object' && v !== null && (v as Record<string, unknown>)['type'] === 'task';

export const isRow = (v: unknown): v is DragData & { type: 'row' } =>
  typeof v === 'object' && v !== null && (v as Record<string, unknown>)['type'] === 'row';
