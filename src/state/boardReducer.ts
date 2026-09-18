import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { Employee, Task, TimelineRange } from '../types';
import { isPositionValid, taskIdGenerator } from '../utils/taskLayout';
import { getNextAvailableColorName } from '../utils/colorPalette';

export interface BoardSnapshot {
  employees: Employee[];
  tasks: Task[];
}

export interface BoardState {
  employees: Employee[];
  tasks: Task[];
  past: BoardSnapshot[];
  future: BoardSnapshot[];
}

export type BoardAction =
  | { type: 'add-task'; payload: { employeeId: string; task: Omit<Task, 'id' | 'employeeId'> } }
  | { type: 'add-employee'; payload: Employee }
  | { type: 'place-task'; payload: { taskId: string; destinationEmployeeId: string; newStartHour: number; range: TimelineRange } }
  | { type: 'resize-task'; payload: { taskId: string; durationHours: number; startHour: number; range: TimelineRange } }
  | { type: 'update-task'; payload: { taskId: string; updates: Partial<Omit<Task, 'id'>> } }
  | { type: 'delete-task'; payload: { taskId: string } }
  | { type: 'reorder-employees'; payload: { sourceId: string; destinationId: string; edge: Edge | null } }
  | { type: 'update-employee'; payload: { employeeId: string; updates: Partial<Omit<Employee, 'id'>> } }
  | { type: 'delete-employee'; payload: { employeeId: string } }
  | { type: 'undo' }
  | { type: 'redo' };

const MAX_HISTORY = 30;

const addTask = (state: BoardSnapshot, payload: { employeeId: string; task: Omit<Task, 'id' | 'employeeId'> }): BoardSnapshot => {
  const usedColors = state.tasks.flatMap((t) => (t.color ? [t.color] : []));
  const color = payload.task.color && !usedColors.includes(payload.task.color) ? payload.task.color : getNextAvailableColorName(usedColors);
  const task: Task = { ...payload.task, color, id: taskIdGenerator(), employeeId: payload.employeeId };
  return { ...state, tasks: [...state.tasks, task] };
};

const addEmployee = (state: BoardSnapshot, payload: Employee): BoardSnapshot => ({
  ...state,
  employees: [...state.employees, payload],
});

const placeTask = (state: BoardSnapshot, payload: { taskId: string; destinationEmployeeId: string; newStartHour: number; range: TimelineRange }): BoardSnapshot => {
  const moved = state.tasks.find((t) => t.id === payload.taskId);
  if (!moved) return state;
  const otherTasks = state.tasks.filter((t) => t.employeeId === payload.destinationEmployeeId && t.id !== payload.taskId);
  if (!isPositionValid(payload.newStartHour, moved.durationHours, otherTasks, payload.range)) return state;
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === payload.taskId ? { ...t, employeeId: payload.destinationEmployeeId, startHour: payload.newStartHour } : t,
    ),
  };
};

const resizeTask = (state: BoardSnapshot, payload: { taskId: string; durationHours: number; startHour: number; range: TimelineRange }): BoardSnapshot => {
  const resized = state.tasks.find((t) => t.id === payload.taskId);
  if (!resized) return state;
  const otherTasks = state.tasks.filter((t) => t.employeeId === resized.employeeId && t.id !== payload.taskId);
  if (!isPositionValid(payload.startHour, payload.durationHours, otherTasks, payload.range)) return state;
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === payload.taskId ? { ...t, durationHours: payload.durationHours, startHour: payload.startHour } : t,
    ),
  };
};

const updateTask = (state: BoardSnapshot, payload: { taskId: string; updates: Partial<Omit<Task, 'id'>> }): BoardSnapshot => ({
  ...state,
  tasks: state.tasks.map((t) => (t.id === payload.taskId ? { ...t, ...payload.updates } : t)),
});

const deleteTask = (state: BoardSnapshot, payload: { taskId: string }): BoardSnapshot => ({
  ...state,
  tasks: state.tasks.filter((t) => t.id !== payload.taskId),
});

const reorderEmployees = (state: BoardSnapshot, payload: { sourceId: string; destinationId: string; edge: Edge | null }): BoardSnapshot => {
  const { sourceId, destinationId, edge } = payload;
  if (sourceId === destinationId) return state;
  const startIndex = state.employees.findIndex((e) => e.id === sourceId);
  const targetIndex = state.employees.findIndex((e) => e.id === destinationId);
  if (startIndex < 0 || targetIndex < 0) return state;
  const finishIndex = getReorderDestinationIndex({
    startIndex,
    indexOfTarget: targetIndex,
    closestEdgeOfTarget: edge,
    axis: 'vertical',
  });
  const next = [...state.employees];
  const [removed] = next.splice(startIndex, 1);
  if (removed) next.splice(finishIndex, 0, removed);
  return { ...state, employees: next };
};

const updateEmployee = (state: BoardSnapshot, payload: { employeeId: string; updates: Partial<Omit<Employee, 'id'>> }): BoardSnapshot => ({
  ...state,
  employees: state.employees.map((e) => (e.id === payload.employeeId ? { ...e, ...payload.updates } : e)),
});

const deleteEmployee = (state: BoardSnapshot, payload: { employeeId: string }): BoardSnapshot => ({
  ...state,
  employees: state.employees.filter((e) => e.id !== payload.employeeId),
  tasks: state.tasks.filter((t) => t.employeeId !== payload.employeeId),
});

const actionHandlers: Record<Exclude<BoardAction['type'], 'undo' | 'redo'>, (state: BoardSnapshot, payload: any) => BoardSnapshot> = {
  'add-task': addTask,
  'add-employee': (s, p) => addEmployee(s, p),
  'place-task': placeTask,
  'resize-task': resizeTask,
  'update-task': updateTask,
  'delete-task': deleteTask,
  'reorder-employees': reorderEmployees,
  'update-employee': updateEmployee,
  'delete-employee': deleteEmployee,
};

export const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  if (action.type === 'undo') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    const currentSnapshot: BoardSnapshot = { employees: state.employees, tasks: state.tasks };
    return {
      employees: previous.employees,
      tasks: previous.tasks,
      past: newPast,
      future: [currentSnapshot, ...state.future],
    };
  }

  if (action.type === 'redo') {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const currentSnapshot: BoardSnapshot = { employees: state.employees, tasks: state.tasks };
    return {
      employees: next.employees,
      tasks: next.tasks,
      past: [...state.past, currentSnapshot],
      future: newFuture,
    };
  }

  const handler = actionHandlers[action.type];
  if (!handler) return state;

  const currentSnapshot: BoardSnapshot = { employees: state.employees, tasks: state.tasks };
  const nextSnapshot = handler(currentSnapshot, action.payload);

  if (nextSnapshot.employees === state.employees && nextSnapshot.tasks === state.tasks) {
    return state;
  }

  const newPast = [...state.past, currentSnapshot];
  if (newPast.length > MAX_HISTORY) {
    newPast.shift();
  }

  return {
    employees: nextSnapshot.employees,
    tasks: nextSnapshot.tasks,
    past: newPast,
    future: [],
  };
};