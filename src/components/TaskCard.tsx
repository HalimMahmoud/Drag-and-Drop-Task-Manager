import React, { useEffect, useRef, useState } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { Task, DragData } from '../types';
import {
  TIMELINE_HOURS,
  MIN_TASK_HOURS,
  isPositionValid,
  PRIORITY_COLORS,
  formatHour,
} from '../utils/board';

interface TaskCardProps {
  task: Task;
  rowTasks: Task[];
  onResize: (taskId: string, durationHours: number, startHour: number) => void;
}

const TaskCard = ({ task, rowTasks, onResize }: TaskCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizing, setResizing] = useState<{
    handle: 'left' | 'right';
    startX: number;
    startDuration: number;
    startStartHour: number;
  } | null>(null);

  const rowTasksRef = useRef(rowTasks);
  useEffect(() => { rowTasksRef.current = rowTasks; }, [rowTasks]);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const parentEl = ref.current?.parentElement;
      if (!parentEl) return;
      const currentHourWidth = parentEl.getBoundingClientRect().width / TIMELINE_HOURS;
      const deltaHours = Math.round(delta / currentHourWidth);
      const otherTasks = rowTasksRef.current.filter((t) => t.id !== task.id);

      if (resizing.handle === 'right') {
        const maxDuration = TIMELINE_HOURS - resizing.startStartHour;
        const newDuration = Math.max(
          MIN_TASK_HOURS,
          Math.min(resizing.startDuration + deltaHours, maxDuration),
        );
        if (isPositionValid(resizing.startStartHour, newDuration, otherTasks)) {
          onResize(task.id, newDuration, resizing.startStartHour);
        }
      } else {
        const rightEdge = resizing.startStartHour + resizing.startDuration;
        const newStartHour = Math.max(
          0,
          Math.min(resizing.startStartHour + deltaHours, rightEdge - MIN_TASK_HOURS),
        );
        const newDuration = rightEdge - newStartHour;
        if (isPositionValid(newStartHour, newDuration, otherTasks)) {
          onResize(task.id, newDuration, newStartHour);
        }
      }
    };

    const handleMouseUp = () => setResizing(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, task.id, onResize]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return draggable({
      element,
      getInitialData: ({ input }) => {
        const rect = element.getBoundingClientRect();
        return {
          type: 'task',
          taskId: task.id,
          employeeId: task.employeeId,
          startHour: task.startHour,
          durationHours: task.durationHours,
          dragOffsetX: input.clientX - rect.left,
        } satisfies DragData;
      },
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [task.id, task.employeeId, task.startHour, task.durationHours]);

  const handleResizeStart =
    (handle: 'left' | 'right') => (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing({
        handle,
        startX: e.clientX,
        startDuration: task.durationHours,
        startStartHour: task.startHour,
      });
    };

  const colors = PRIORITY_COLORS[task.priority.toLowerCase()] ?? PRIORITY_COLORS.low;

  return (
    <div
      ref={ref}
      className={['task', isDragging ? 'task--dragging' : ''].filter(Boolean).join(' ')}
      style={{
        left: `${(task.startHour / TIMELINE_HOURS) * 100}%`,
        width: `${(task.durationHours / TIMELINE_HOURS) * 100}%`,
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
      data-task-id={task.id}
    >
      <div
        className="resize-handle resize-handle--left"
        style={{ backgroundColor: colors.dim }}
        onMouseDown={handleResizeStart('left')}
      />

      <div className="task__top">
        <span className={`priority priority--${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <span className="task__id">#{task.id}</span>
      </div>

      <div className="task__title">{task.title}</div>

      <div className="task__footer">
        <span>
          {formatHour(task.startHour)}–{formatHour(task.startHour + task.durationHours)}
        </span>
        <span>⋮⋮</span>
      </div>

      <div
        className="resize-handle resize-handle--right"
        style={{ backgroundColor: colors.dim }}
        onMouseDown={handleResizeStart('right')}
      />
    </div>
  );
};

export default TaskCard;
