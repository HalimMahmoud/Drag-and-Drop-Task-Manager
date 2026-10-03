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
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Login page', priority: 'High', durationSlot: 2, startSlot: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Dashboard', priority: 'Medium', durationSlot: 2, startSlot: 3, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'API integration', priority: 'High', durationSlot: 3, startSlot: 6, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ahmed', title: 'Responsive fixes', priority: 'Low', durationSlot: 2, startSlot: 10, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Auth API', priority: 'High', durationSlot: 2, startSlot: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Orders service', priority: 'Medium', durationSlot: 3, startSlot: 4, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'mohamed', title: 'Database migration', priority: 'Low', durationSlot: 2, startSlot: 9, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Wireframes', priority: 'Medium', durationSlot: 2, startSlot: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Design system', priority: 'High', durationSlot: 3, startSlot: 4, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'omar', title: 'Mobile screens', priority: 'Low', durationSlot: 2, startSlot: 8, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ali', title: 'Regression tests', priority: 'High', durationSlot: 2, startSlot: 0, color: getTaskColor() },
  { id: taskIdGenerator(), employeeId: 'ali', title: 'E2E tests', priority: 'Medium', durationSlot: 2, startSlot: 4, color: getTaskColor() },
];

export { COLOR_PALETTE, getColorVariant, getNextAvailableColor };
