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

export type DraggableData = DragData | Record<string | symbol, unknown> | null | undefined;

export const isTask = (data: DraggableData): data is TaskDragData =>
  typeof data === 'object' && data !== null && 'type' in data && data.type === 'task';

export const isRow = (data: DraggableData): data is RowDragData =>
  typeof data === 'object' && data !== null && 'type' in data && data.type === 'row';
