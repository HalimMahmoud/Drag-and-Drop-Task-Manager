import { customAlphabet } from 'nanoid';
import type { Employee, Priority, PriorityColorKey, PriorityColors, Task } from '../types';

export const TIMELINE_HOURS = 12;
export const MIN_TASK_HOURS = 1;

export const taskIdGenerator = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  3,
);

export const formatHour = (hour: number) => {
  const h = Math.floor(hour) % 12 || 12;
  return `${h}:00`;
};

export function isPositionValid(
  startHour: number,
  durationHours: number,
  otherTasks: Task[],
): boolean {
  if (startHour < 0 || startHour + durationHours > TIMELINE_HOURS) return false;
  return !otherTasks.some(
    (t) =>
      startHour < t.startHour + t.durationHours &&
      startHour + durationHours > t.startHour,
  );
}

export function findNearestValidStartHour(
  targetStartHour: number,
  durationHours: number,
  otherTasks: Task[],
): number | null {
  if (isPositionValid(targetStartHour, durationHours, otherTasks)) {
    return targetStartHour;
  }
  for (let delta = 1; delta <= TIMELINE_HOURS; delta++) {
    if (isPositionValid(targetStartHour - delta, durationHours, otherTasks)) {
      return targetStartHour - delta;
    }
    if (isPositionValid(targetStartHour + delta, durationHours, otherTasks)) {
      return targetStartHour + delta;
    }
  }
  return null;
}

export function snapToHour(
  inputClientX: number,
  taskAreaRect: DOMRect,
  dragOffsetX: number,
  durationHours: number,
): number {
  const relativeX = inputClientX - taskAreaRect.left;
  const currentHourWidth = taskAreaRect.width / TIMELINE_HOURS;
  const rawHour = Math.round((relativeX - dragOffsetX) / currentHourWidth);
  return Math.max(0, Math.min(rawHour, TIMELINE_HOURS - durationHours));
}

export const PRIORITY_COLORS: Record<PriorityColorKey, PriorityColors> = {
  high: { bg: '#fff0f0', border: '#c9372c', dim: '#c9372c33' },
  medium: { bg: '#fffbeb', border: '#b45309', dim: '#b4530933' },
  low: { bg: '#f0f9ff', border: '#0c66e4', dim: '#0c66e433' },
};

const PRIORITY_COLOR_KEY: Record<Priority, PriorityColorKey> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
};

export const priorityToColorKey = (priority: Priority): PriorityColorKey =>
  PRIORITY_COLOR_KEY[priority];

export const EMPLOYEES: Employee[] = [
  { id: 'ahmed', name: 'Ahmed', role: 'Frontend Developer' },
  { id: 'mohamed', name: 'Mohamed', role: 'Backend Developer' },
  { id: 'omar', name: 'Omar', role: 'UI/UX Designer' },
  { id: 'ali', name: 'Ali', role: 'QA Engineer' },
];

export const INITIAL_TASKS: Task[] = [
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Login page', priority: 'High', durationHours: 2, startHour: 0, color: '#ef4444' },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Dashboard', priority: 'Medium', durationHours: 2, startHour: 3, color: '#f59e0b' },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'API integration', priority: 'High', durationHours: 3, startHour: 6, color: '#ef4444' },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Responsive fixes', priority: 'Low', durationHours: 2, startHour: 10, color: '#3b82f6' },

  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Auth API', priority: 'High', durationHours: 2, startHour: 0, color: '#ef4444' },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Orders service', priority: 'Medium', durationHours: 3, startHour: 4, color: '#f59e0b' },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Database migration', priority: 'Low', durationHours: 2, startHour: 9, color: '#3b82f6' },

  { id: taskIdGenerator(), employeeId: 'omar', title: 'Wireframes', priority: 'Medium', durationHours: 2, startHour: 0, color: '#f59e0b' },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Design system', priority: 'High', durationHours: 3, startHour: 4, color: '#ef4444' },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Mobile screens', priority: 'Low', durationHours: 2, startHour: 8, color: '#3b82f6' },

  { id: taskIdGenerator(), employeeId: 'ali', title: 'Regression tests', priority: 'High', durationHours: 2, startHour: 0, color: '#ef4444' },
  { id: taskIdGenerator(), employeeId: 'ali', title: 'E2E tests', priority: 'Medium', durationHours: 2, startHour: 4, color: '#f59e0b' },
];
