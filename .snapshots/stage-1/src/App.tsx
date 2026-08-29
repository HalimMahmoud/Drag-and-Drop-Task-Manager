import React, { useEffect, useRef, useState } from 'react';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';

type Employee = {
  id: string;
  name: string;
  role: string;
};

type Task = {
  id: string;
  employeeId: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  durationHours: number;
};

const EMPLOYEES: Employee[] = [
  { id: 'ahmed', name: 'Ahmed', role: 'Frontend Developer' },
  { id: 'mohamed', name: 'Mohamed', role: 'Backend Developer' },
  { id: 'omar', name: 'Omar', role: 'UI/UX Designer' },
  { id: 'ali', name: 'Ali', role: 'QA Engineer' },
];

const INITIAL_TASKS: Task[] = [
  { id: 't1', employeeId: 'ahmed', title: 'Login page', priority: 'High', durationHours: 2 },
  { id: 't2', employeeId: 'ahmed', title: 'Dashboard', priority: 'Medium', durationHours: 2 },
  { id: 't3', employeeId: 'ahmed', title: 'API integration', priority: 'High', durationHours: 3 },
  { id: 't4', employeeId: 'ahmed', title: 'Responsive fixes', priority: 'Low', durationHours: 2 },

  { id: 't5', employeeId: 'mohamed', title: 'Auth API', priority: 'High', durationHours: 2 },
  { id: 't6', employeeId: 'mohamed', title: 'Orders service', priority: 'Medium', durationHours: 3 },
  { id: 't7', employeeId: 'mohamed', title: 'Database migration', priority: 'Low', durationHours: 2 },

  { id: 't8', employeeId: 'omar', title: 'Wireframes', priority: 'Medium', durationHours: 2 },
  { id: 't9', employeeId: 'omar', title: 'Design system', priority: 'High', durationHours: 3 },
  { id: 't10', employeeId: 'omar', title: 'Mobile screens', priority: 'Low', durationHours: 2 },

  { id: 't11', employeeId: 'ali', title: 'Regression tests', priority: 'High', durationHours: 2 },
  { id: 't12', employeeId: 'ali', title: 'E2E tests', priority: 'Medium', durationHours: 2 },
];

type DragData =
  | { type: 'task'; taskId: string; employeeId: string }
  | { type: 'row'; employeeId: string };

const isTask = (value: Record<string, unknown>): value is DragData & { type: 'task' } =>
  value.type === 'task';

const isRow = (value: Record<string, unknown>): value is DragData & { type: 'row' } =>
  value.type === 'row';

const HOUR_WIDTH = 100;
const TIMELINE_HOURS = 12;

const formatHour = (hour: number) => {
  const h = Math.floor(hour) % 12 || 12;
  return `${h}:00`;
};

function TimeHeader() {
  return (
    <div className="timeline-header">
      <div className="timeline-header__spacer" />
      <div className="timeline-header__track">
        {Array.from({ length: TIMELINE_HOURS }, (_, i) => (
          <div key={i} className="timeline-header__label" style={{ gridColumn: i + 1 }}>
            {formatHour(i)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  index,
  startHour,
  onDrop,
  onResize,
}: {
  task: Task;
  index: number;
  startHour: number;
  onDrop: (taskId: string, destinationEmployeeId: string, destinationIndex: number) => void;
  onResize: (taskId: string, durationHours: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [resizing, setResizing] = useState<{ handle: 'left' | 'right'; startX: number; startDuration: number } | null>(null);

  const MIN_HOURS = 1;

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const deltaHours = Math.round(delta / HOUR_WIDTH);
      let newDuration = resizing.startDuration;
      if (resizing.handle === 'right') {
        newDuration = resizing.startDuration + deltaHours;
      } else {
        newDuration = resizing.startDuration - deltaHours;
      }
      newDuration = Math.max(MIN_HOURS, newDuration);
      const maxDuration = 12 - startHour;
      onResize(task.id, Math.min(newDuration, maxDuration));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, task.id, startHour, onResize]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: 'task',
          taskId: task.id,
          employeeId: task.employeeId,
          index,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: ({ input, element }) =>
          attachClosestEdge(
            {
              type: 'task',
              taskId: task.id,
              employeeId: task.employeeId,
              index,
            },
            {
              input,
              element,
              allowedEdges: ['left', 'right'],
            },
          ),
        canDrop: ({ source }) =>
          isTask(source.data) && source.data.taskId !== task.id,
        onDragEnter: ({ self }) => {
          setClosestEdge(extractClosestEdge(self.data));
        },
        onDrag: ({ self }) => {
          setClosestEdge(extractClosestEdge(self.data));
        },
        onDragLeave: () => setClosestEdge(null),
        onDrop: ({ self, source }) => {
          const edge = extractClosestEdge(self.data);
          const sourceTaskId = source.data.taskId;

          if (typeof sourceTaskId !== 'string') {
            setClosestEdge(null);
            return;
          }

          const destinationEmployeeId =
            typeof self.data.employeeId === 'string'
              ? self.data.employeeId
              : task.employeeId;

          const destinationIndex =
            edge === 'right' ? index + 1 : index;

          onDrop(sourceTaskId, destinationEmployeeId, destinationIndex);
          setClosestEdge(null);
        },
      }),
    );
  }, [task.id, task.employeeId, index, onDrop]);

  const handleResizeStart = (handle: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ handle, startX: e.clientX, startDuration: task.durationHours });
  };

  const priorityColors: Record<string, { bg: string; border: string; dim: string }> = {
    high: { bg: '#fff0f0', border: '#c9372c', dim: '#c9372c33' },
    medium: { bg: '#fffbeb', border: '#b45309', dim: '#b4530933' },
    low: { bg: '#f0f9ff', border: '#0c66e4', dim: '#0c66e433' },
  };

  const colors = priorityColors[task.priority.toLowerCase()] || priorityColors.low;

  const durationHours = task.durationHours;

  return (
    <div
      ref={ref}
      className={[
        'task',
        isDragging ? 'task--dragging' : '',
        closestEdge === 'left' ? 'task--edge-left' : '',
        closestEdge === 'right' ? 'task--edge-right' : '',
      ].join(' ')}
      style={{
        gridColumn: `${startHour + 1} / span ${durationHours}`,
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
        <span className="task__id">{task.id.toUpperCase()}</span>
      </div>

      <div className="task__title">{task.title}</div>

      <div className="task__footer">
        <span>Task</span>
        <span>⋮⋮</span>
      </div>

      <div
        className="resize-handle resize-handle--right"
        style={{ backgroundColor: colors.dim }}
        onMouseDown={handleResizeStart('right')}
      />
    </div>
  );
}

function EmployeeRow({
  employee,
  tasks,
  onDropTask,
  onReorderRow,
  onResizeTask,
}: {
  employee: Employee;
  tasks: Task[];
  onDropTask: (taskId: string, employeeId: string, index: number) => void;
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  onResizeTask: (taskId: string, newWidth: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const taskAreaRef = useRef<HTMLDivElement>(null);
  const [isRowOver, setIsRowOver] = useState(false);
  const [rowEdge, setRowEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    const taskArea = taskAreaRef.current;
    if (!row || !taskArea) return;

    return combine(
      draggable({
        element: row,
        getInitialData: () => ({
          type: 'row',
          employeeId: employee.id,
        }),
      }),

      dropTargetForElements({
        element: row,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { type: 'row', employeeId: employee.id },
            {
              input,
              element,
              allowedEdges: ['left', 'right'],
            },
          ),
        canDrop: ({ source }) =>
          source.data.type === 'task' || source.data.type === 'row',
        onDragEnter: ({ source, self }) => {
          setIsRowOver(true);
          setRowEdge(extractClosestEdge(self.data));

          if (source.data.type === 'task') return;
        },
        onDrag: ({ self }) => {
          setIsRowOver(true);
          setRowEdge(extractClosestEdge(self.data));
        },
        onDragLeave: () => {
          setIsRowOver(false);
          setRowEdge(null);
        },
        onDrop: ({ source, self }) => {
          const sourceData = source.data;
          const edge = extractClosestEdge(self.data);

          setIsRowOver(false);
          setRowEdge(null);

          if (isRow(sourceData)) {
            onReorderRow(sourceData.employeeId, employee.id, edge);
          } else if (isTask(sourceData)) {
            // Dropping directly on the empty row area appends to that employee.
            onDropTask(sourceData.taskId, employee.id, tasks.length);
          }
        },
      }),

      dropTargetForElements({
        element: taskArea,
        canDrop: ({ source }) => source.data.type === 'task',
        getData: () => ({
          type: 'task-area',
          employeeId: employee.id,
        }),
        onDragEnter: () => setIsRowOver(true),
        onDragLeave: () => setIsRowOver(false),
        onDrop: ({ source }) => {
          if (isTask(source.data)) {
            onDropTask(source.data.taskId, employee.id, tasks.length);
          }
          setIsRowOver(false);
        },
      }),
    );
  }, [employee.id, tasks.length, onDropTask, onReorderRow]);

  return (
    <div
      ref={rowRef}
      className={[
        'employee-row',
        isRowOver ? 'employee-row--over' : '',
        rowEdge === 'left' ? 'employee-row--edge-left' : '',
        rowEdge === 'right' ? 'employee-row--edge-right' : '',
      ].join(' ')}
    >
      <div className="employee">
        <div className="employee__avatar">
          {employee.name.charAt(0)}
        </div>
        <div>
          <div className="employee__name">{employee.name}</div>
          <div className="employee__role">{employee.role}</div>
        </div>
      </div>

      <div ref={taskAreaRef} className="task-area">
        {tasks.map((task, index) => {
          const startHour = tasks.slice(0, index).reduce((sum, t) => sum + t.durationHours, 0);
          return (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              startHour={startHour}
              onDrop={onDropTask}
              onResize={onResizeTask}
            />
          );
        })}

          {tasks.length === 0 && (
            <div className="empty-row">Drop a task here</div>
          )}
        </div>
    </div>
  );
}

export default function App() {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [hourWidth, setHourWidth] = useState(100);
  const trackRef = useRef<HTMLDivElement>(null);

  const stableEmployees = useRef(employees);
  const stableTasks = useRef(tasks);

  useEffect(() => {
    stableEmployees.current = employees;
    stableTasks.current = tasks;
  }, [employees, tasks]);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setHourWidth(trackRef.current.clientWidth / TIMELINE_HOURS);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const moveTask = (
    taskId: string,
    destinationEmployeeId: string,
    requestedIndex: number,
  ) => {
    setTasks((current) => {
      const sourceTask = current.find((task) => task.id === taskId);
      if (!sourceTask) return current;

      const sourceEmployeeId = sourceTask.employeeId;

      const sourceItems = current.filter(
        (task) => task.employeeId === sourceEmployeeId,
      );

      const destinationItems = current.filter(
        (task) => task.employeeId === destinationEmployeeId && task.id !== taskId,
      );

      let destinationIndex = requestedIndex;

      if (sourceEmployeeId === destinationEmployeeId) {
        const sourceIndex = sourceItems.findIndex((task) => task.id === taskId);

        if (sourceIndex < destinationIndex) {
          destinationIndex -= 1;
        }
      }

      destinationIndex = Math.max(
        0,
        Math.min(destinationIndex, destinationItems.length),
      );

      const updatedTask = {
        ...sourceTask,
        employeeId: destinationEmployeeId,
      };

      destinationItems.splice(destinationIndex, 0, updatedTask);

      const otherTasks = current.filter(
        (task) =>
          task.employeeId !== sourceEmployeeId &&
          task.employeeId !== destinationEmployeeId,
      );

      const sourceRemaining =
        sourceEmployeeId === destinationEmployeeId
          ? []
          : sourceItems.filter((task) => task.id !== taskId);

      const result = [
        ...otherTasks,
        ...(sourceEmployeeId === destinationEmployeeId
          ? destinationItems
          : sourceRemaining),
      ];

      if (sourceEmployeeId !== destinationEmployeeId) {
        result.push(...destinationItems);
      }

      // Preserve employee/task row order by rebuilding according to employee order.
      return stableEmployees.current.flatMap((employee) =>
        result.filter((task) => task.employeeId === employee.id),
      );
    });
  };

  const reorderEmployees = (
    sourceId: string,
    destinationId: string,
    edge: Edge | null,
  ) => {
    if (sourceId === destinationId) return;

    setEmployees((current) => {
      const startIndex = current.findIndex((e) => e.id === sourceId);
      const targetIndex = current.findIndex((e) => e.id === destinationId);

      if (startIndex < 0 || targetIndex < 0) return current;

      const finishIndex =
        getReorderDestinationIndex({
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

  const resizeTask = (taskId: string, durationHours: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, durationHours } : task,
      ),
    );
  };

  useEffect(() => {
    const cleanup = monitorForElements({
      onDrop({ source }) {
        if (!source.data) return;

        if (isTask(source.data)) {
          const taskId = source.data.taskId;
          const task = stableTasks.current.find((item) => item.id === taskId);
          if (task) {
            const element = document.querySelector(
              `[data-task-id="${taskId}"]`,
            );
            if (element instanceof HTMLElement) {
              triggerPostMoveFlash(element);
            }
            liveRegion.announce(
              `${task.title} moved to ${stableEmployees.current.find(
                (employee) => employee.id === task.employeeId,
              )?.name ?? 'employee'}.`,
            );
          }
        }
      },
    });

    return () => {
      cleanup();
      liveRegion.cleanup();
    };
  }, []);

  const tasksForEmployee = (employeeId: string) =>
    tasks.filter((task) => task.employeeId === employeeId);

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>Horizontal Task Board</h1>
          <p>Drag tasks horizontally or move them between employees.</p>
        </div>

        <div className="legend">
          <span>← → Reorder</span>
          <span>↕ Move between rows</span>
        </div>
      </header>

      <section className="board-shell">
        <div className="board">
          <TimeHeader />
          {employees.map((employee) => (
          <EmployeeRow
            key={employee.id}
            employee={employee}
            tasks={tasksForEmployee(employee.id)}
            onDropTask={moveTask}
            onReorderRow={reorderEmployees}
            onResizeTask={resizeTask}
          />
          ))}
        </div>
      </section>
    </main>
  );
}
