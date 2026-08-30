export type Employee = {
  id: string;
  name: string;
  role: string;
};

export type Task = {
  id: string;
  employeeId: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  durationHours: number;
  startHour: number;
};

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

export const isTask = (v: Record<string, unknown>): v is DragData & { type: 'task' } =>
  v.type === 'task';

export const isRow = (v: Record<string, unknown>): v is DragData & { type: 'row' } =>
  v.type === 'row';
