import type { Employee, Task, ColorPaletteName } from '../types';
import { taskIdGenerator } from './taskLayout';
import { getNextAvailableColor, getColorVariant, COLOR_PALETTE } from './colorPalette';

const usedEmployeeColors = new Set<ColorPaletteName>();
const usedTaskColors = new Set<ColorPaletteName>();

function getEmployeeColor(): ColorPaletteName {
  const color = getNextAvailableColor([...usedEmployeeColors]);
  usedEmployeeColors.add(color.name);
  return color.name;
}

function getTaskColor(): ColorPaletteName {
  const color = getNextAvailableColor([...usedTaskColors]);
  usedTaskColors.add(color.name);
  return color.name;
}

export const EMPLOYEES: Employee[] = [
  { id: 'ahmed', name: 'Ahmed', role: 'Frontend Developer', color: getEmployeeColor() },
  { id: 'mohamed', name: 'Mohamed', role: 'Backend Developer', color: getEmployeeColor() },
  { id: 'omar', name: 'Omar', role: 'UI/UX Designer', color: getEmployeeColor() },
  { id: 'ali', name: 'Ali', role: 'QA Engineer', color: getEmployeeColor() },
];

export const INITIAL_TASKS: Task[] = [
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Login page', priority: 'High', durationHours: 2, startHour: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Dashboard', priority: 'Medium', durationHours: 2, startHour: 3, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'API integration', priority: 'High', durationHours: 3, startHour: 6, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Responsive fixes', priority: 'Low', durationHours: 2, startHour: 10, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Auth API', priority: 'High', durationHours: 2, startHour: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Orders service', priority: 'Medium', durationHours: 3, startHour: 4, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Database migration', priority: 'Low', durationHours: 2, startHour: 9, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Wireframes', priority: 'Medium', durationHours: 2, startHour: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Design system', priority: 'High', durationHours: 3, startHour: 4, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Mobile screens', priority: 'Low', durationHours: 2, startHour: 8, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ali', title: 'Regression tests', priority: 'High', durationHours: 2, startHour: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ali', title: 'E2E tests', priority: 'Medium', durationHours: 2, startHour: 4, color: getTaskColor() },
];

export { COLOR_PALETTE, getColorVariant, getNextAvailableColor };