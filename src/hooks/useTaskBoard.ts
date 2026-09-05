import { useEffect, useRef, useState, type RefObject } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { isTask, type Employee, type Task } from '../types';
import { TIMELINE_HOURS, isPositionValid } from '../utils/board';

export interface UseTaskBoardReturn {
  employees: Employee[];
  tasks: Task[];
  hourWidth: number;
  boardRef: RefObject<HTMLDivElement | null>;
  placeTask: (taskId: string, destinationEmployeeId: string, newStartHour: number) => void;
  reorderEmployees: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  resizeTask: (taskId: string, durationHours: number, startHour: number) => void;
  tasksForEmployee: (employeeId: string) => Task[];
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  updateEmployee: (employeeId: string, updates: Partial<Omit<Employee, 'id'>>) => void;
  deleteEmployee: (employeeId: string) => void;
}

export function useTaskBoard(initialEmployees: Employee[], initialTasks: Task[]): UseTaskBoardReturn {
  const [employees, setEmployees] = useState(initialEmployees);
  const [tasks, setTasks] = useState(initialTasks);
  const [hourWidth, setHourWidth] = useState(100);
  const boardRef = useRef<HTMLDivElement>(null);

  const employeesRef = useRef(employees);
  const tasksRef = useRef(tasks);
  useEffect(() => {
    employeesRef.current = employees;
    tasksRef.current = tasks;
  }, [employees, tasks]);

  useEffect(() => {
    if (!boardRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHourWidth(Math.max(10, (entry.contentRect.width - 230) / TIMELINE_HOURS));
    });
    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  const placeTask = (taskId: string, destinationEmployeeId: string, newStartHour: number) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      const otherTasks = prev.filter((t) => t.employeeId === destinationEmployeeId && t.id !== taskId);
      if (!isPositionValid(newStartHour, task.durationHours, otherTasks)) return prev;
      return prev.map((t) => (t.id === taskId ? { ...t, employeeId: destinationEmployeeId, startHour: newStartHour } : t));
    });
  };

  const reorderEmployees = (sourceId: string, destinationId: string, edge: Edge | null) => {
    if (sourceId === destinationId) return;
    setEmployees((prev) => {
      const startIndex = prev.findIndex((e) => e.id === sourceId);
      const targetIndex = prev.findIndex((e) => e.id === destinationId);
      if (startIndex < 0 || targetIndex < 0) return prev;

      const finishIndex = getReorderDestinationIndex({
        startIndex,
        indexOfTarget: targetIndex,
        closestEdgeOfTarget: edge,
        axis: 'vertical',
      });
      const next = [...prev];
      const [removed] = next.splice(startIndex, 1);
      if (removed) next.splice(finishIndex, 0, removed);
      return next;
    });
  };

  const resizeTask = (taskId: string, durationHours: number, startHour: number) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      const otherTasks = prev.filter((t) => t.employeeId === task.employeeId && t.id !== taskId);
      if (!isPositionValid(startHour, durationHours, otherTasks)) return prev;
      return prev.map((t) => (t.id === taskId ? { ...t, durationHours, startHour } : t));
    });
  };

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop({ source }) {
        if (!isTask(source.data)) return;
        const taskData = source.data;
        const task = tasksRef.current.find((t) => t.id === taskData.taskId);
        if (!task) return;

        const targetEl = document.querySelector(`[data-task-id="${taskData.taskId}"]`);
        if (targetEl instanceof HTMLElement) triggerPostMoveFlash(targetEl);

        const employeeName = employeesRef.current.find((e) => e.id === task.employeeId)?.name ?? 'employee';
        liveRegion.announce(`${task.title} moved to ${employeeName}.`);
      },
    });
    return () => {
      cleanup();
      liveRegion.cleanup();
    };
  }, []);

  return {
    employees,
    tasks,
    hourWidth,
    boardRef,
    placeTask,
    reorderEmployees,
    resizeTask,
    tasksForEmployee: (employeeId) => tasks.filter((t) => t.employeeId === employeeId),
    updateTask: (taskId, updates) => setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))),
    deleteTask: (taskId) => setTasks((prev) => prev.filter((t) => t.id !== taskId)),
    updateEmployee: (empId, updates) => setEmployees((prev) => prev.map((e) => (e.id === empId ? { ...e, ...updates } : e))),
    deleteEmployee: (empId) => {
      setEmployees((prev) => prev.filter((e) => e.id !== empId));
      setTasks((prev) => prev.filter((t) => t.employeeId !== empId));
    },
  };
}
