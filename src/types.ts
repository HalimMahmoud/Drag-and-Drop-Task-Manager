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

export const isTask = (data: unknown): data is TaskDragData =>
  Boolean(data && typeof data === 'object' && (data as { type?: unknown }).type === 'task');

export const isRow = (data: unknown): data is RowDragData =>
  Boolean(data && typeof data === 'object' && (data as { type?: unknown }).type === 'row');
