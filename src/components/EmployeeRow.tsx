import { useEffect, useRef, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { isTask, isRow, type DragData, type Employee, type Task } from '../types';
import { TIMELINE_HOURS, findNearestValidStartHour, snapToHour } from '../utils/board';
import TaskCard from '../components/TaskCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ItemMenu } from '@/components/ItemMenu';
import { cn } from '@/lib/utils';

interface EmployeeRowProps {
  employee: Employee;
  tasks: Task[];
  onPlaceTask: (taskId: string, employeeId: string, startHour: number) => void;
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  onResizeTask: (taskId: string, durationHours: number, startHour: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
}

export default function EmployeeRow({
  employee,
  tasks,
  onPlaceTask,
  onReorderRow,
  onResizeTask,
  onEditTask,
  onDeleteTask,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const taskAreaRef = useRef<HTMLDivElement>(null);

  const [isRowOver, setIsRowOver] = useState(false);
  const [rowEdge, setRowEdge] = useState<Edge | null>(null);
  const [dropIndicatorHour, setDropIndicatorHour] = useState<number | null>(null);

  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  useEffect(() => {
    const row = rowRef.current;
    const taskArea = taskAreaRef.current;
    if (!row || !taskArea) return;

    const resetRowDropState = () => {
      setIsRowOver(false);
      setRowEdge(null);
    };

    const resetTaskDropState = () => {
      setIsRowOver(false);
      setDropIndicatorHour(null);
    };

    return combine(
      draggable({
        element: row,
        ...(dragHandleRef.current ? { dragHandle: dragHandleRef.current } : {}),
        getInitialData: () => ({ type: 'row', employeeId: employee.id } satisfies DragData),
      }),

      dropTargetForElements({
        element: row,
        canDrop: ({ source }) => isRow(source.data),
        getData: ({ input, element }) =>
          attachClosestEdge({ type: 'row', employeeId: employee.id }, { input, element, allowedEdges: ['top', 'bottom'] }),
        onDragEnter: ({ source, self }) => {
          if (isRow(source.data)) {
            setIsRowOver(true);
            setRowEdge(extractClosestEdge(self.data));
          }
        },
        onDrag: ({ source, self }) => {
          if (isRow(source.data)) setRowEdge(extractClosestEdge(self.data));
        },
        onDragLeave: resetRowDropState,
        onDrop: ({ source, self }) => {
          resetRowDropState();
          if (isRow(source.data)) onReorderRow(source.data.employeeId, employee.id, extractClosestEdge(self.data));
        },
      }),

      dropTargetForElements({
        element: taskArea,
        getDropEffect: () => 'move',
        canDrop: ({ input, source, element }) => {
          if (!isTask(source.data)) return false;
          const taskData = source.data;
          const rawHour = snapToHour(input.clientX, element.getBoundingClientRect(), taskData.dragOffsetX, taskData.durationHours);
          const otherTasks = tasksRef.current.filter((t) => t.employeeId === employee.id && t.id !== taskData.taskId);
          return findNearestValidStartHour(rawHour, taskData.durationHours, otherTasks) !== null;
        },
        getData: ({ input, source }) => {
          if (!isTask(source.data)) return { type: 'task-area' as const, employeeId: employee.id, targetStartHour: null };
          const taskData = source.data;
          const rawHour = snapToHour(input.clientX, taskArea.getBoundingClientRect(), taskData.dragOffsetX, taskData.durationHours);
          const otherTasks = tasksRef.current.filter((t) => t.employeeId === employee.id && t.id !== taskData.taskId);
          return {
            type: 'task-area' as const,
            employeeId: employee.id,
            targetStartHour: findNearestValidStartHour(rawHour, taskData.durationHours, otherTasks),
          };
        },
        onDragEnter: ({ self }) => {
          setIsRowOver(true);
          const targetHour = self.data['targetStartHour'];
          setDropIndicatorHour(typeof targetHour === 'number' ? targetHour : null);
        },
        onDrag: ({ self }) => {
          const targetHour = self.data['targetStartHour'];
          setDropIndicatorHour(typeof targetHour === 'number' ? targetHour : null);
        },
        onDragLeave: resetTaskDropState,
        onDrop: ({ source, self }) => {
          resetTaskDropState();
          const targetHour = self.data['targetStartHour'];
          if (isTask(source.data) && typeof targetHour === 'number') {
            onPlaceTask(source.data.taskId, employee.id, targetHour);
          }
        },
      }),
    );
  }, [employee.id, onPlaceTask, onReorderRow]);

  return (
    <div
      ref={rowRef}
      className={cn(
        'employee-row',
        isRowOver && 'employee-row--over',
        rowEdge === 'top' && 'employee-row--edge-top',
        rowEdge === 'bottom' && 'employee-row--edge-bottom',
      )}
    >
      <div ref={dragHandleRef} className="employee">
        <div>
          <Avatar
            className="border-2 ring-1 ring-black/5"
            style={{ borderColor: employee.color ?? '#3b82f6' }}
          >
            <AvatarFallback
              className="font-semibold"
              style={{
                color: employee.color ?? '#3b82f6',
                backgroundColor: employee.color ? `${employee.color}15` : '#f0f6ff',
              }}
            >
              {employee.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="employee__name">{employee.name}</div>
            <div className="employee__role">{employee.role}</div>
          </div>
        </div>
        <ItemMenu onEdit={() => onEditEmployee(employee)} onDelete={() => onDeleteEmployee(employee)} />
      </div>

      <div ref={taskAreaRef} className="task-area">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            rowTasks={tasks}
            onResize={onResizeTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        ))}

        {dropIndicatorHour !== null && (
          <div className="drop-indicator" style={{ left: `${(dropIndicatorHour / TIMELINE_HOURS) * 100}%` }} />
        )}

        {tasks.length === 0 && dropIndicatorHour === null && (
          <div className="empty-row">Drop a task here</div>
        )}
      </div>
    </div>
  );
}
