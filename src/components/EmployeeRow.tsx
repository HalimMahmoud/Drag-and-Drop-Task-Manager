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

function EmployeeRow({
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

  const stableTasksRef = useRef(tasks);
  useEffect(() => { stableTasksRef.current = tasks; }, [tasks]);

  useEffect(() => {
    const row = rowRef.current;
    const taskArea = taskAreaRef.current;
    if (!row || !taskArea) return;

    return combine(
      draggable({
        element: row,
        ...(dragHandleRef.current ? { dragHandle: dragHandleRef.current } : {}),
        getInitialData: () => ({ type: 'row', employeeId: employee.id } satisfies DragData),
      }),

      dropTargetForElements({
        element: row,
        getData: ({ input, element: el }) =>
          attachClosestEdge(
            { type: 'row', employeeId: employee.id },
            { input, element: el, allowedEdges: ['left', 'right'] },
          ),
        canDrop: ({ source }) => isRow(source.data),
        onDragEnter: ({ source, self }) => {
          if (isRow(source.data)) {
            setIsRowOver(true);
            setRowEdge(extractClosestEdge(self.data));
          }
        },
        onDrag: ({ source, self }) => {
          if (isRow(source.data)) setRowEdge(extractClosestEdge(self.data));
        },
        onDragLeave: () => {
          setIsRowOver(false);
          setRowEdge(null);
        },
        onDrop: ({ source, self }) => {
          setIsRowOver(false);
          setRowEdge(null);
          const data = source.data;
          if (isRow(data)) {
            onReorderRow(data.employeeId, employee.id, extractClosestEdge(self.data));
          }
        },
      }),

      dropTargetForElements({
        element: taskArea,
        canDrop: ({ input, source, element }) => {
          const data = source.data;
          if (!isTask(data)) return false;
          const rect = element.getBoundingClientRect();
          const rawHour = snapToHour(
            input.clientX,
            rect,
            data.dragOffsetX,
            data.durationHours,
          );
          const otherTasks = stableTasksRef.current.filter(
            (t) => t.employeeId === employee.id && t.id !== data.taskId,
          );
          return findNearestValidStartHour(rawHour, data.durationHours, otherTasks) !== null;
        },
        getDropEffect: () => 'move',

        getData: ({ input, source }) => {
          const data = source.data;
          if (!isTask(data)) {
            return {
              type: 'task-area' as const,
              employeeId: employee.id,
              targetStartHour: null,
            };
          }
          const rect = taskArea.getBoundingClientRect();
          const rawHour = snapToHour(
            input.clientX,
            rect,
            data.dragOffsetX,
            data.durationHours,
          );
          const otherTasks = stableTasksRef.current.filter((t) => t.id !== data.taskId);
          const targetStartHour = findNearestValidStartHour(
            rawHour,
            data.durationHours,
            otherTasks,
          );

          return {
            type: 'task-area' as const,
            employeeId: employee.id,
            targetStartHour,
          };
        },

        onDragEnter: ({ self }) => {
          setIsRowOver(true);
          const targetStartHour = self.data['targetStartHour'];
          setDropIndicatorHour(typeof targetStartHour === 'number' ? targetStartHour : null);
        },
        onDrag: ({ self }) => {
          const targetStartHour = self.data['targetStartHour'];
          setDropIndicatorHour(typeof targetStartHour === 'number' ? targetStartHour : null);
        },
        onDragLeave: () => {
          setIsRowOver(false);
          setDropIndicatorHour(null);
        },
        onDrop: ({ source, self }) => {
          setIsRowOver(false);
          setDropIndicatorHour(null);
          const data = source.data;
          if (isTask(data)) {
            const targetStartHour = self.data['targetStartHour'];
            if (typeof targetStartHour === 'number') {
              onPlaceTask(data.taskId, employee.id, targetStartHour);
            }
          }
        },
      }),
    );
  }, [employee.id, onPlaceTask, onReorderRow]);

  return (
    <div
      ref={rowRef}
      className={[
        'employee-row',
        isRowOver ? 'employee-row--over' : '',
        rowEdge === 'left' ? 'employee-row--edge-left' : '',
        rowEdge === 'right' ? 'employee-row--edge-right' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="employee">
        <div ref={dragHandleRef}>
          <Avatar>
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
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
          <div
            className="drop-indicator"
            style={{ left: `${(dropIndicatorHour / TIMELINE_HOURS) * 100}%` }}
          />
        )}

        {tasks.length === 0 && dropIndicatorHour === null && (
          <div className="empty-row">Drop a task here</div>
        )}
      </div>
    </div>
  );
}

export default EmployeeRow;
