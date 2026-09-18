import { useEffect, type RefObject } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { isTask, type Employee, type Task } from '../../types';

export function useDropFeedback(tasksRef: RefObject<Task[]>, employeesRef: RefObject<Employee[]>) {
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
  }, [tasksRef, employeesRef]);
}