import type { Dispatch } from 'react';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { Employee, Task, TimelineRange } from '../types';
import { isPositionValid, taskIdGenerator } from '../utils/taskLayout';
import type { BoardAction, BoardState } from './boardReducer';

export function createBoardActions(
  getState: () => BoardState,
  getRange: () => TimelineRange,
  dispatch: Dispatch<BoardAction>,
) {
  return {
    addTask: (employeeId: string, task: Omit<Task, 'id' | 'employeeId'>): boolean => {
      const { tasks } = getState();
      const otherTasks = tasks.filter((t) => t.employeeId === employeeId);
      if (!isPositionValid(task.startSlot, task.durationSlot, otherTasks, getRange())) return false;
      dispatch({ type: 'add-task', payload: { employeeId, task } });
      return true;
    },

    addEmployee: (employee: Omit<Employee, 'id'>): Employee => {
      const created: Employee = { ...employee, id: taskIdGenerator() };
      dispatch({ type: 'add-employee', payload: created });
      return created;
    },

    placeTask: (taskId: string, destinationEmployeeId: string, newStartSlot: number) =>
      dispatch({ type: 'place-task', payload: { taskId, destinationEmployeeId, newStartSlot, range: getRange() } }),

    reorderEmployees: (sourceId: string, destinationId: string, edge: Edge | null) =>
      dispatch({ type: 'reorder-employees', payload: { sourceId, destinationId, edge } }),

    resizeTask: (taskId: string, durationSlot: number, startSlot: number) =>
      dispatch({ type: 'resize-task', payload: { taskId, durationSlot, startSlot, range: getRange() } }),

    updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) =>
      dispatch({ type: 'update-task', payload: { taskId, updates } }),

    deleteTask: (taskId: string) => dispatch({ type: 'delete-task', payload: { taskId } }),

    updateEmployee: (employeeId: string, updates: Partial<Omit<Employee, 'id'>>) =>
      dispatch({ type: 'update-employee', payload: { employeeId, updates } }),

    deleteEmployee: (employeeId: string) => dispatch({ type: 'delete-employee', payload: { employeeId } }),

    undo: () => dispatch({ type: 'undo' }),

    redo: () => dispatch({ type: 'redo' }),
  };
}