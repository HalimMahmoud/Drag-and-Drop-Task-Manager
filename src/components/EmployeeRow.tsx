import React, { useEffect, useRef, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { isTask, isRow, type Employee, type Task, type DragData } from '../types';
import { TIMELINE_HOURS, findNearestValidStartHour, snapToHour } from '../utils/board';
import TaskCard from '../components/TaskCard';

interface EmployeeRowProps {
  employee: Employee;
  tasks: Task[];
  onPlaceTask: (taskId: string, employeeId: string, startHour: number) => void;
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  onResizeTask: (taskId: string, durationHours: number, startHour: number) => void;
}

function EmployeeRow({
  employee,
  tasks,
  onPlaceTask,
  onReorderRow,
  onResizeTask,
}: EmployeeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
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
        getInitialData: () => ({ type: 'row', employeeId: employee.id } satisfies DragData),
      }),

      dropTargetForElements({
        element: row,
        getData: ({ input, element: el }) =>
          attachClosestEdge(
            { type: 'row', employeeId: employee.id },
            { input, element: el, allowedEdges: ['left', 'right'] },
          ),
        canDrop: ({ source }) => source.data.type === 'row',
        onDragEnter: ({ source, self }) => {
          if (source.data.type === 'row') {
            setIsRowOver(true);
            setRowEdge(extractClosestEdge(self.data));
          }
        },
        onDrag: ({ source, self }) => {
          if (source.data.type === 'row') setRowEdge(extractClosestEdge(self.data));
        },
        onDragLeave: () => {
          setIsRowOver(false);
          setRowEdge(null);
        },
        onDrop: ({ source, self }) => {
          setIsRowOver(false);
          setRowEdge(null);
          if (isRow(source.data)) {
            onReorderRow(source.data.employeeId, employee.id, extractClosestEdge(self.data));
          }
        },
      }),

      dropTargetForElements({
        element: taskArea,
        canDrop: ({ input, source, element }) => {
          if (source.data.type !== 'task') return false;
          const rect = element.getBoundingClientRect();
          const dragOffsetX =
            typeof source.data.dragOffsetX === 'number' ? source.data.dragOffsetX : 0;
          const durationHours =
            typeof source.data.durationHours === 'number' ? source.data.durationHours : 1;
          const taskId =
            typeof source.data.taskId === 'string' ? source.data.taskId : '';
          const rawHour = snapToHour(input.clientX, rect, dragOffsetX, durationHours);
          const otherTasks = stableTasksRef.current.filter(
            (t) => t.employeeId === employee.id && t.id !== taskId,
          );
          return findNearestValidStartHour(rawHour, durationHours, otherTasks) !== null;
        },
        getDropEffect: () => 'move',

        getData: ({ input, source }) => {
          const rect = taskArea.getBoundingClientRect();
          const dragOffsetX =
            typeof source.data.dragOffsetX === 'number' ? source.data.dragOffsetX : 0;
          const durationHours =
            typeof source.data.durationHours === 'number' ? source.data.durationHours : 1;
          const taskId =
            typeof source.data.taskId === 'string' ? source.data.taskId : '';

          const rawHour = snapToHour(input.clientX, rect, dragOffsetX, durationHours);
          const otherTasks = stableTasksRef.current.filter((t) => t.id !== taskId);
          const targetStartHour = findNearestValidStartHour(rawHour, durationHours, otherTasks);

          return {
            type: 'task-area',
            employeeId: employee.id,
            targetStartHour,
          };
        },

        onDragEnter: ({ self }) => {
          setIsRowOver(true);
          const h = self.data.targetStartHour;
          setDropIndicatorHour(typeof h === 'number' ? h : null);
        },
        onDrag: ({ self }) => {
          const h = self.data.targetStartHour;
          setDropIndicatorHour(typeof h === 'number' ? h : null);
        },
        onDragLeave: () => {
          setIsRowOver(false);
          setDropIndicatorHour(null);
        },
        onDrop: ({ source, self }) => {
          setIsRowOver(false);
          setDropIndicatorHour(null);
          if (isTask(source.data)) {
            const h = self.data.targetStartHour;
            if (typeof h === 'number') {
              onPlaceTask(source.data.taskId, employee.id, h);
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
        <div className="employee__avatar">{employee.name.charAt(0)}</div>
        <div>
          <div className="employee__name">{employee.name}</div>
          <div className="employee__role">{employee.role}</div>
        </div>
      </div>

      <div ref={taskAreaRef} className="task-area">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            rowTasks={tasks}
            onResize={onResizeTask}
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
