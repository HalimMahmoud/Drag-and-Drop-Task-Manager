import React, { useEffect, useRef, useState, type RefObject } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { Task, DragData } from '../types';
import {
  TIMELINE_HOURS,
  MIN_TASK_HOURS,
  isPositionValid,
  PRIORITY_COLORS,
  priorityToColorKey,
  formatHour,
} from '../utils/board';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ItemMenu } from '@/components/ItemMenu';

interface TaskCardProps {
  task: Task;
  rowTasks: Task[];
  onResize: (taskId: string, durationHours: number, startHour: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

interface ResizeState {
  handle: 'left' | 'right';
  startX: number;
  startDuration: number;
  startStartHour: number;
}

const useResize = (
  task: Task,
  onResize: (taskId: string, durationHours: number, startHour: number) => void,
  elementRef: RefObject<HTMLDivElement | null>,
  rowTasks: Task[],
) => {
  const [resizing, setResizing] = useState<ResizeState | null>(null);

  const taskIdRef = useRef(task.id);
  taskIdRef.current = task.id;

  const rowTasksRef = useRef(rowTasks);
  rowTasksRef.current = rowTasks;

  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const parentEl = elementRef.current?.parentElement;
      if (!parentEl) return;
      const currentHourWidth = parentEl.getBoundingClientRect().width / TIMELINE_HOURS;
      const deltaHours = Math.round(delta / currentHourWidth);
      const otherTasks = rowTasksRef.current.filter((t) => t.id !== taskIdRef.current);

      if (resizing.handle === 'right') {
        const maxDuration = TIMELINE_HOURS - resizing.startStartHour;
        const newDuration = Math.max(
          MIN_TASK_HOURS,
          Math.min(resizing.startDuration + deltaHours, maxDuration),
        );
        if (isPositionValid(resizing.startStartHour, newDuration, otherTasks)) {
          onResizeRef.current(taskIdRef.current, newDuration, resizing.startStartHour);
        }
      } else {
        const rightEdge = resizing.startStartHour + resizing.startDuration;
        const newStartHour = Math.max(
          0,
          Math.min(resizing.startStartHour + deltaHours, rightEdge - MIN_TASK_HOURS),
        );
        const newDuration = rightEdge - newStartHour;
        if (isPositionValid(newStartHour, newDuration, otherTasks)) {
          onResizeRef.current(taskIdRef.current, newDuration, newStartHour);
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
  }, [resizing, elementRef]);

  const startResize = (handle: 'left' | 'right') => (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      handle,
      startX: e.clientX,
      startDuration: task.durationHours,
      startStartHour: task.startHour,
    });
  };

  return { startResize };
};

const useDraggableTask = (
  elementRef: RefObject<HTMLDivElement | null>,
  dragHandleRef: RefObject<HTMLDivElement | null>,
  task: Task,
) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    return draggable({
      element,
      ...(dragHandleRef.current ? { dragHandle: dragHandleRef.current } : {}),
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

  return isDragging;
};

const TaskCard = ({ task, rowTasks, onResize, onEditTask, onDeleteTask }: TaskCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const { startResize } = useResize(task, onResize, ref, rowTasks);
  const isDragging = useDraggableTask(ref, dragHandleRef, task);

  const priorityColorKey = priorityToColorKey(task.priority);
  const priorityColors = PRIORITY_COLORS[priorityColorKey];
  const taskColor = task.color ?? priorityColors.border;
  const dimColor = task.color ? `${task.color}66` : priorityColors.dim;

  return (
    <div
      ref={ref}
      className={cn('task', isDragging && 'task--dragging')}
      style={{
        left: `${(task.startHour / TIMELINE_HOURS) * 100}%`,
        width: `${(task.durationHours / TIMELINE_HOURS) * 100}%`,
        backgroundColor: 'white',
        boxShadow: `inset 0 0 0 1000px ${dimColor}`,
      }}
      data-task-id={task.id}
    >
      <div
        className="resize-handle resize-handle--left"
        style={{ backgroundColor: taskColor }}
        onMouseDown={startResize('left')}
      />

      <div ref={dragHandleRef} className="task__content">
        <div className="task__top">
          <Badge variant={priorityColorKey}>
            {task.priority}
          </Badge>
        </div>

        <div className="task__title">{task.title}</div>

        <div className="task__footer">
          <span>
            {formatHour(task.startHour)}–{formatHour(task.startHour + task.durationHours)}
          </span>
          <span className="task__id">#{task.id}</span>
        </div>
      </div>

      <div className="task__menu">
        <ItemMenu onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task)} />
      </div>

      <div
        className="resize-handle resize-handle--right"
        style={{ backgroundColor: taskColor }}
        onMouseDown={startResize('right')}
      />
    </div>
  );
};

export default TaskCard;
