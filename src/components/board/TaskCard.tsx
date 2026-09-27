'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { Task, DragData, TimelineRange, ColorPaletteName } from '../../types';
import { PRIORITY_COLORS, priorityToColorKey } from '../../utils/taskLayout';
import { toTimelinePercent } from '../../utils/timelinePercent';
import { formatHour } from '../../utils/timeFormat';
import { computeResizeTarget, type ResizeHandleState } from '../../utils/resize';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ItemMenu } from '@/components/ItemMenu';
import { useTheme } from '../../hooks/useTheme';
import { getColorByName, getColorVariant, withOpacity } from '../../utils/colorPalette';

interface TaskCardProps {
  task: Task;
  rowTasks: Task[];
  onResize: (taskId: string, durationHours: number, startHour: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  supervisorMode: boolean;
  timelineRange: TimelineRange;
}

const useTaskResize = (
  task: Task,
  onResize: (taskId: string, durationHours: number, startHour: number) => void,
  elementRef: RefObject<HTMLDivElement | null>,
  rowTasks: Task[],
  supervisorMode: boolean,
  timelineRange: TimelineRange,
) => {
  const [resizing, setResizing] = useState<ResizeHandleState | null>(null);

  useEffect(() => {
    if (!supervisorMode || !resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const parentEl = elementRef.current?.parentElement;
      if (!parentEl) return;

      const hourWidth = parentEl.getBoundingClientRect().width / (timelineRange.endHour - timelineRange.startHour);
      const deltaHours = Math.round((e.clientX - resizing.startX) / hourWidth);
      const otherTasks = rowTasks.filter((t) => t.id !== task.id);
      const target = computeResizeTarget(resizing, deltaHours, otherTasks, timelineRange);
      if (target) onResize(task.id, target.newDuration, target.newStartHour);
    };

    const handleMouseUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, elementRef, task.id, rowTasks, onResize, supervisorMode, timelineRange]);

  const startResize = (handle: 'left' | 'right') => (e: ReactMouseEvent) => {
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

const useDraggableTask = (elementRef: RefObject<HTMLDivElement | null>, dragHandleRef: RefObject<HTMLDivElement | null>, task: Task, supervisorMode: boolean) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!supervisorMode) return;
    const element = elementRef.current;
    if (!element) return;

    return draggable({
      element,
      ...(dragHandleRef.current ? { dragHandle: dragHandleRef.current } : {}),
      getInitialData: ({ input }) =>
        ({
          type: 'task',
          taskId: task.id,
          employeeId: task.employeeId,
          startHour: task.startHour,
          durationHours: task.durationHours,
          dragOffsetX: input.clientX - element.getBoundingClientRect().left,
        }) satisfies DragData,
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [task.id, task.employeeId, task.startHour, task.durationHours, elementRef, dragHandleRef, supervisorMode]);

  return isDragging;
};

export default function TaskCard({ task, rowTasks, onResize, onEditTask, onDeleteTask, supervisorMode, timelineRange }: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const { startResize } = useTaskResize(task, onResize, cardRef, rowTasks, supervisorMode, timelineRange);
  const isDragging = useDraggableTask(cardRef, dragHandleRef, task, supervisorMode);

  const priorityKey = priorityToColorKey(task.priority);
  const priorityColors = PRIORITY_COLORS[priorityKey];
  
  // Resolve color variant based on theme
  const taskColorVariant = task.color ? getColorByName(task.color) : null;
  const taskColors = taskColorVariant ? getColorVariant(taskColorVariant, theme) : null;
  const accentColor = taskColors?.border ?? priorityColors.border;
  const dimColor = taskColors?.dim ?? priorityColors.dim;
  const bgColor = taskColors?.border
    ? withOpacity(taskColors.border, 0.3)
    : priorityColors.dim;

  return (
    <div
      ref={cardRef}
      className={cn('task', isDragging && 'task--dragging')}
      style={{
        left: `${toTimelinePercent(task.startHour, timelineRange)}%`,
        width: `${toTimelinePercent(timelineRange.startHour + task.durationHours, timelineRange)}%`,
        backgroundColor: bgColor,
        boxShadow: `inset 0 0 0 1000px ${bgColor}`,
      }}
      data-task-id={task.id}
    >
      {supervisorMode && (
        <div className="resize-handle resize-handle--left" style={{ backgroundColor: accentColor }} onMouseDown={startResize('left')} />
      )}

      <div ref={dragHandleRef} className="task__content">
        <div className="task__top">
          <Badge variant={priorityKey}>{task.priority}</Badge>
          {supervisorMode && <ItemMenu onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task)} />}
        </div>
        <div className="task__title">{task.title}</div>
        <div className="task__description">{task.description || '\u00A0'}</div>
        <div className="task__footer">
          <span>{formatHour(task.startHour)}–{formatHour(task.startHour + task.durationHours)}</span>
          <span className="task__id">#{task.id}</span>
        </div>
      </div>

      {supervisorMode && (
        <div className="resize-handle resize-handle--right" style={{ backgroundColor: accentColor }} onMouseDown={startResize('right')} />
      )}
    </div>
  );
}
