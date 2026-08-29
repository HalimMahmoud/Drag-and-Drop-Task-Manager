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

// ─── Types ───────────────────────────────────────────────────────────────────

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
  /** Hour-slot the left edge sits on (0 = 12:00, 11 = 11:00). */
  startHour: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const TIMELINE_HOURS = 12;
const MIN_TASK_HOURS = 1;

// ─── Seed data ───────────────────────────────────────────────────────────────

const EMPLOYEES: Employee[] = [
  { id: 'ahmed',   name: 'Ahmed',   role: 'Frontend Developer' },
  { id: 'mohamed', name: 'Mohamed', role: 'Backend Developer'  },
  { id: 'omar',    name: 'Omar',    role: 'UI/UX Designer'      },
  { id: 'ali',     name: 'Ali',     role: 'QA Engineer'         },
];

const INITIAL_TASKS: Task[] = [
  { id: 't1',  employeeId: 'ahmed',   title: 'Login page',         priority: 'High',   durationHours: 2, startHour: 0  },
  { id: 't2',  employeeId: 'ahmed',   title: 'Dashboard',          priority: 'Medium', durationHours: 2, startHour: 3  },
  { id: 't3',  employeeId: 'ahmed',   title: 'API integration',    priority: 'High',   durationHours: 3, startHour: 6  },
  { id: 't4',  employeeId: 'ahmed',   title: 'Responsive fixes',   priority: 'Low',    durationHours: 2, startHour: 10 },

  { id: 't5',  employeeId: 'mohamed', title: 'Auth API',           priority: 'High',   durationHours: 2, startHour: 0  },
  { id: 't6',  employeeId: 'mohamed', title: 'Orders service',     priority: 'Medium', durationHours: 3, startHour: 4  },
  { id: 't7',  employeeId: 'mohamed', title: 'Database migration', priority: 'Low',    durationHours: 2, startHour: 9  },

  { id: 't8',  employeeId: 'omar',    title: 'Wireframes',         priority: 'Medium', durationHours: 2, startHour: 0  },
  { id: 't9',  employeeId: 'omar',    title: 'Design system',      priority: 'High',   durationHours: 3, startHour: 4  },
  { id: 't10', employeeId: 'omar',    title: 'Mobile screens',     priority: 'Low',    durationHours: 2, startHour: 8  },

  { id: 't11', employeeId: 'ali',     title: 'Regression tests',   priority: 'High',   durationHours: 2, startHour: 0  },
  { id: 't12', employeeId: 'ali',     title: 'E2E tests',          priority: 'Medium', durationHours: 2, startHour: 4  },
];

// ─── Drag data ───────────────────────────────────────────────────────────────

type DragData =
  | {
      type: 'task';
      taskId: string;
      employeeId: string;
      startHour: number;
      durationHours: number;
      /** px from the card's left edge where the user grabbed. */
      dragOffsetX: number;
    }
  | { type: 'row'; employeeId: string };

const isTask = (v: Record<string, unknown>): v is DragData & { type: 'task' } =>
  v.type === 'task';

const isRow = (v: Record<string, unknown>): v is DragData & { type: 'row' } =>
  v.type === 'row';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatHour = (hour: number) => {
  const h = Math.floor(hour) % 12 || 12;
  return `${h}:00`;
};

/** True when [startHour, startHour+duration) fits on the timeline without
 *  overlapping any of the provided tasks. */
function isPositionValid(
  startHour: number,
  durationHours: number,
  otherTasks: Task[],
): boolean {
  if (startHour < 0 || startHour + durationHours > TIMELINE_HOURS) return false;
  return !otherTasks.some(
    (t) =>
      startHour < t.startHour + t.durationHours &&
      startHour + durationHours > t.startHour,
  );
}

/**
 * Starting from `targetStartHour`, search outward (left then right) for the
 * nearest hour-slot where the task fits without overlapping.
 * Returns `null` if the row is too full to accept the task.
 */
function findNearestValidStartHour(
  targetStartHour: number,
  durationHours: number,
  otherTasks: Task[],
): number | null {
  if (isPositionValid(targetStartHour, durationHours, otherTasks)) {
    return targetStartHour;
  }
  for (let delta = 1; delta <= TIMELINE_HOURS; delta++) {
    if (isPositionValid(targetStartHour - delta, durationHours, otherTasks)) {
      return targetStartHour - delta;
    }
    if (isPositionValid(targetStartHour + delta, durationHours, otherTasks)) {
      return targetStartHour + delta;
    }
  }
  return null;
}

/**
 * Compute the raw (unchecked) snap hour from a mouse position over the task-area.
 * The drag offset keeps the task from jumping under the cursor.
 */
function snapToHour(
  inputClientX: number,
  taskAreaRect: DOMRect,
  dragOffsetX: number,
  durationHours: number,
): number {
  const relativeX = inputClientX - taskAreaRect.left;
  const currentHourWidth = taskAreaRect.width / TIMELINE_HOURS;
  const rawHour = Math.round((relativeX - dragOffsetX) / currentHourWidth);
  return Math.max(0, Math.min(rawHour, TIMELINE_HOURS - durationHours));
}

// ─── Priority colour map ──────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, { bg: string; border: string; dim: string }> = {
  high:   { bg: '#fff0f0', border: '#c9372c', dim: '#c9372c33' },
  medium: { bg: '#fffbeb', border: '#b45309', dim: '#b4530933' },
  low:    { bg: '#f0f9ff', border: '#0c66e4', dim: '#0c66e433' },
};

// ─── TimeHeader ───────────────────────────────────────────────────────────────

function TimeHeader() {
  return (
    <div className="timeline-header">
      <div className="timeline-header__spacer" />
      <div className="timeline-header__track">
        {Array.from({ length: TIMELINE_HOURS }, (_, i) => (
          <div key={i} className="timeline-header__label">
            {formatHour(i)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  rowTasks,
  onResize,
}: {
  task: Task;
  /** All tasks in the same employee row (including this task). Used to clamp resize. */
  rowTasks: Task[];
  onResize: (taskId: string, durationHours: number, startHour: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizing, setResizing] = useState<{
    handle: 'left' | 'right';
    startX: number;
    startDuration: number;
    startStartHour: number;
  } | null>(null);

  // Keep a stable ref so the mousemove handler always reads fresh rowTasks
  const rowTasksRef = useRef(rowTasks);
  useEffect(() => { rowTasksRef.current = rowTasks; }, [rowTasks]);

  // ── Resize mouse tracking ──
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;

      const parentEl = ref.current?.parentElement;
      if (!parentEl) return;
      const currentHourWidth = parentEl.getBoundingClientRect().width / TIMELINE_HOURS;

      const deltaHours = Math.round(delta / currentHourWidth);
      const otherTasks = rowTasksRef.current.filter((t) => t.id !== task.id);

      if (resizing.handle === 'right') {
        // Right edge moves; startHour is fixed.
        const maxDuration = TIMELINE_HOURS - resizing.startStartHour;
        const newDuration = Math.max(
          MIN_TASK_HOURS,
          Math.min(resizing.startDuration + deltaHours, maxDuration),
        );
        // Only apply if it doesn't overlap a neighbour
        if (isPositionValid(resizing.startStartHour, newDuration, otherTasks)) {
          onResize(task.id, newDuration, resizing.startStartHour);
        }
      } else {
        // Left edge moves; right edge (startHour + duration) is fixed.
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

  // ── PDD draggable ──
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

  const handleResizeStart = (handle: 'left' | 'right') => (e: React.MouseEvent) => {
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
        <span className="task__id">{task.id.toUpperCase()}</span>
      </div>

      <div className="task__title">{task.title}</div>

      <div className="task__footer">
        <span>{formatHour(task.startHour)}–{formatHour(task.startHour + task.durationHours)}</span>
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

// ─── EmployeeRow ──────────────────────────────────────────────────────────────

function EmployeeRow({
  employee,
  tasks,
  onPlaceTask,
  onReorderRow,
  onResizeTask,
}: {
  employee: Employee;
  tasks: Task[];
  onPlaceTask: (taskId: string, employeeId: string, startHour: number) => void;
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  onResizeTask: (taskId: string, durationHours: number, startHour: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const taskAreaRef = useRef<HTMLDivElement>(null);
  const [isRowOver, setIsRowOver] = useState(false);
  const [rowEdge, setRowEdge] = useState<Edge | null>(null);
  /** The target hour slot number (0-11) for the drop-preview indicator, or null. */
  const [dropIndicatorHour, setDropIndicatorHour] = useState<number | null>(null);

  // Stable ref so getData (inside useEffect) always reads the latest tasks
  const stableTasksRef = useRef(tasks);
  useEffect(() => { stableTasksRef.current = tasks; }, [tasks]);

  useEffect(() => {
    const row = rowRef.current;
    const taskArea = taskAreaRef.current;
    if (!row || !taskArea) return;

    return combine(
      // ── Row draggable (for reordering employees) ──
      draggable({
        element: row,
        getInitialData: () => ({ type: 'row', employeeId: employee.id } satisfies DragData),
      }),

      // ── Row drop target – handles employee reordering ──
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

      // ── Task-area drop target – grid-snap placement with collision avoidance ──
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

          // Exclude the dragged task from collision check so it doesn't block itself
          const otherTasks = stableTasksRef.current.filter((t) => t.id !== taskId);
          const targetStartHour = findNearestValidStartHour(rawHour, durationHours, otherTasks);

          return {
            type: 'task-area',
            employeeId: employee.id,
            targetStartHour, // number | null
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
        isRowOver           ? 'employee-row--over'       : '',
        rowEdge === 'left'  ? 'employee-row--edge-left'  : '',
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

        {/* Blue line showing where the task will snap to */}
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

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const boardRef = useRef<HTMLDivElement>(null);
  const [hourWidth, setHourWidth] = useState(100);

  const stableEmployees = useRef(employees);
  const stableTasks = useRef(tasks);
  useEffect(() => {
    stableEmployees.current = employees;
    stableTasks.current = tasks;
  }, [employees, tasks]);

  // Measure the width of a single hour-column dynamically to feed the CSS custom property
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Track width = total board width minus employee panel (230px)
        const trackWidth = entry.contentRect.width - 230;
        setHourWidth(Math.max(10, trackWidth / TIMELINE_HOURS));
      }
    });
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  // ── Place a task at a specific grid hour (collision-safe) ──
  const placeTask = (taskId: string, destinationEmployeeId: string, newStartHour: number) => {
    setTasks((current) => {
      const task = current.find((t) => t.id === taskId);
      if (!task) return current;

      const rowTasks = current.filter(
        (t) => t.employeeId === destinationEmployeeId && t.id !== taskId,
      );

      // Final guard: reject if somehow the position is still invalid
      if (!isPositionValid(newStartHour, task.durationHours, rowTasks)) return current;

      return current.map((t) =>
        t.id === taskId
          ? { ...t, employeeId: destinationEmployeeId, startHour: newStartHour }
          : t,
      );
    });
  };

  // ── Reorder employee rows ──
  const reorderEmployees = (sourceId: string, destinationId: string, edge: Edge | null) => {
    if (sourceId === destinationId) return;
    setEmployees((current) => {
      const startIndex  = current.findIndex((e) => e.id === sourceId);
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

  // ── Resize a task — silently rejects if the new bounds overlap a neighbour ──
  const resizeTask = (taskId: string, durationHours: number, startHour: number) => {
    setTasks((current) => {
      const task = current.find((t) => t.id === taskId);
      if (!task) return current;

      const rowTasks = current.filter(
        (t) => t.employeeId === task.employeeId && t.id !== taskId,
      );

      // Reject if new [startHour, startHour+durationHours) overlaps any neighbour
      if (!isPositionValid(startHour, durationHours, rowTasks)) return current;

      return current.map((t) =>
        t.id === taskId ? { ...t, durationHours, startHour } : t,
      );
    });
  };

  // ── Global monitor for post-move flash + live region ──
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

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>Horizontal Task Board</h1>
          <p>Drag tasks to any hour slot · Resize with handles · Drag rows to reorder</p>
        </div>
        <div className="legend">
          <span>⟷ Drag to any hour</span>
          <span>↕ Move between rows</span>
          <span>⟺ Resize edges</span>
        </div>
      </header>

      <section className="board-shell">
        <div
          ref={boardRef}
          className="board"
          style={{ '--hour-width': `${hourWidth}px` } as React.CSSProperties}
        >
          <TimeHeader />
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              tasks={tasksForEmployee(employee.id)}
              onPlaceTask={placeTask}
              onReorderRow={reorderEmployees}
              onResizeTask={resizeTask}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
