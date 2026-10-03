'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { Task, DragData, TimelineConfig, ColorPaletteName } from '../../types';
import { PRIORITY_COLORS, priorityToColorKey } from '../../utils/taskLayout';
import { toTimelinePercent } from '../../utils/timelinePercent';
import { formatSlotRange } from '../../utils/timeUnits';
import { computeResizeTarget, type ResizeHandleState } from '../../utils/resize';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ItemMenu } from '@/components/ItemMenu';
import { useTheme } from '../../hooks/useTheme';
import { getColorByName, getColorVariant, withOpacity } from '../../utils/colorPalette';

interface TaskCardProps {
  task: Task;
  rowTasks: Task[];
  onResize: (taskId: string, durationSlot: number, startSlot: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  supervisorMode: boolean;
  timelineConfig: TimelineConfig;
}

const useTaskResize = (
  task: Task,
  onResize: (taskId: string, durationSlot: number, startSlot: number) => void,
  elementRef: RefObject<HTMLDivElement | null>,
  rowTasks: Task[],
  supervisorMode: boolean,
  timelineConfig: TimelineConfig,
) => {
  const [resizing, setResizing] = useState<ResizeHandleState | null>(null);

  useEffect(() => {
    if (!supervisorMode || !resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const parentEl = elementRef.current?.parentElement;
      if (!parentEl) return;

      const slotWidth = parentEl.getBoundingClientRect().width / (timelineConfig.endSlot - timelineConfig.startSlot);
      const deltaSlots = Math.round((e.clientX - resizing.startX) / slotWidth);
      const otherTasks = rowTasks.filter((t) => t.id !== task.id);
      const target = computeResizeTarget(resizing, deltaSlots, otherTasks, timelineConfig);
      if (target) onResize(task.id, target.newDurationSlot, target.newStartSlot);
    };

    const handleMouseUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, elementRef, task.id, rowTasks, onResize, supervisorMode, timelineConfig]);

  const startResize = (handle: 'left' | 'right') => (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      handle,
      startX: e.clientX,
      startDurationSlot: task.durationSlot,
      startStartSlot: task.startSlot,
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
          startSlot: task.startSlot,
          durationSlot: task.durationSlot,
          dragOffsetX: input.clientX - element.getBoundingClientRect().left,
        }) satisfies DragData,
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [task.id, task.employeeId, task.startSlot, task.durationSlot, elementRef, dragHandleRef, supervisorMode]);

  return isDragging;
};

export default function TaskCard({ task, rowTasks, onResize, onEditTask, onDeleteTask, supervisorMode, timelineConfig }: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const { startResize } = useTaskResize(task, onResize, cardRef, rowTasks, supervisorMode, timelineConfig);
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
        left: `${toTimelinePercent(task.startSlot, timelineConfig)}%`,
        width: `${(task.durationSlot / (timelineConfig.endSlot - timelineConfig.startSlot)) * 100}%`,
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
          <span>{formatSlotRange(task.startSlot, task.durationSlot, timelineConfig.unit)}</span>
          <span className="task__id">#{task.id}</span>
        </div>
      </div>

      {supervisorMode && (
        <div className="resize-handle resize-handle--right" style={{ backgroundColor: accentColor }} onMouseDown={startResize('right')} />
      )}
    </div>
  );
}
