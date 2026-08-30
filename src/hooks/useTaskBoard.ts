import { useEffect, useRef, useState, type RefObject } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { isTask, type Employee, type Task } from '../types';
import {
  TIMELINE_HOURS,
  isPositionValid,
} from '../utils/board';

export interface UseTaskBoardReturn {
  employees: Employee[];
  tasks: Task[];
  hourWidth: number;
  boardRef: RefObject<HTMLDivElement | null>;
  placeTask: (taskId: string, destinationEmployeeId: string, newStartHour: number) => void;
  reorderEmployees: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  resizeTask: (taskId: string, durationHours: number, startHour: number) => void;
  tasksForEmployee: (employeeId: string) => Task[];
}

export function useTaskBoard(initialEmployees: Employee[], initialTasks: Task[]): UseTaskBoardReturn {
  const [employees, setEmployees] = useState(initialEmployees);
  const [tasks, setTasks] = useState(initialTasks);
  const [hourWidth, setHourWidth] = useState(100);
  const boardRef = useRef<HTMLDivElement>(null);

  const stableEmployees = useRef(employees);
  const stableTasks = useRef(tasks);
  useEffect(() => {
    stableEmployees.current = employees;
    stableTasks.current = tasks;
  }, [employees, tasks]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const trackWidth = entry.contentRect.width - 230;
        setHourWidth(Math.max(10, trackWidth / TIMELINE_HOURS));
      }
    });
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  const placeTask = (taskId: string, destinationEmployeeId: string, newStartHour: number) => {
    setTasks((current) => {
      const task = current.find((t) => t.id === taskId);
      if (!task) return current;

      const rowTasks = current.filter(
        (t) => t.employeeId === destinationEmployeeId && t.id !== taskId,
      );

      if (!isPositionValid(newStartHour, task.durationHours, rowTasks)) return current;

      return current.map((t) =>
        t.id === taskId
          ? { ...t, employeeId: destinationEmployeeId, startHour: newStartHour }
          : t,
      );
    });
  };

  const reorderEmployees = (sourceId: string, destinationId: string, edge: Edge | null) => {
    if (sourceId === destinationId) return;
    setEmployees((current) => {
      const startIndex = current.findIndex((e) => e.id === sourceId);
      const targetIndex = current.findIndex((e) => e.id === destinationId);
      if (startIndex < 0 || targetIndex < 0) return current;

      const finishIndex = getReorderDestinationIndex({
        startIndex,
        indexOfTarget: targetIndex,
        closestEdgeOfTarget: edge,
        axis: 'horizontal',
      });

      const next = [...current];
      const [removed] = next.splice(startIndex, 1);
      next.splice(finishIndex, 0, removed);
      return next;
    });
  };

  const resizeTask = (taskId: string, durationHours: number, startHour: number) => {
    setTasks((current) => {
      const task = current.find((t) => t.id === taskId);
      if (!task) return current;

      const rowTasks = current.filter(
        (t) => t.employeeId === task.employeeId && t.id !== taskId,
      );

      if (!isPositionValid(startHour, durationHours, rowTasks)) return current;

      return current.map((t) =>
        t.id === taskId ? { ...t, durationHours, startHour } : t,
      );
    });
  };

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop({ source }) {
        if (!source.data || !isTask(source.data)) return;
        const task = stableTasks.current.find((t) => t.id === source.data.taskId);
        if (!task) return;

        const el = document.querySelector(`[data-task-id="${source.data.taskId}"]`);
        if (el instanceof HTMLElement) triggerPostMoveFlash(el);

        const name = stableEmployees.current.find((e) => e.id === task.employeeId)?.name ?? 'employee';
        liveRegion.announce(`${task.title} moved to ${name}.`);
      },
    });
    return () => { cleanup(); liveRegion.cleanup(); };
  }, []);

  const tasksForEmployee = (employeeId: string) =>
    tasks.filter((t) => t.employeeId === employeeId);

  return {
    employees,
    tasks,
    hourWidth,
    boardRef,
    placeTask,
    reorderEmployees,
    resizeTask,
    tasksForEmployee,
  };
}
