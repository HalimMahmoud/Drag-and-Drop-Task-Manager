import { useEffect, useReducer, useRef, useState, type RefObject } from 'react';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { DEFAULT_TIMELINE_CONFIG, type Employee, type Task, type TimelineConfig, type TimelineRange } from '../../types';
import { isValidTimelineRange } from '../../utils/timelineRange';
import { isTaskVisibleInRange } from '../../utils/taskLayout';
import { boardReducer, type BoardState } from '../../state/boardReducer';
import { createBoardActions } from '../../state/boardActions';
import { useTimelineWidth } from './useTimelineWidth';
import { useDropFeedback } from './useDropFeedback';
import { useLatest } from './useLatest';

export interface UseTaskBoardReturn {
  employees: Employee[];
  tasks: Task[];
  slotWidth: number;
  timelineConfig: TimelineConfig;
  timelineRange: TimelineRange;
  hiddenTaskCount: number;
  boardRef: RefObject<HTMLDivElement | null>;
  setTimelineConfig: (config: TimelineConfig) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addTask: (employeeId: string, task: Omit<Task, 'id' | 'employeeId'>) => boolean;
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  placeTask: (taskId: string, destinationEmployeeId: string, newStartSlot: number) => void;
  reorderEmployees: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  resizeTask: (taskId: string, durationSlot: number, startSlot: number) => void;
  tasksForEmployee: (employeeId: string) => Task[];
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  updateEmployee: (employeeId: string, updates: Partial<Omit<Employee, 'id'>>) => void;
  deleteEmployee: (employeeId: string) => void;
}

export function useTaskBoard(
  initialEmployees: Employee[],
  initialTasks: Task[],
  initialTimelineConfig: TimelineConfig = DEFAULT_TIMELINE_CONFIG
): UseTaskBoardReturn {
  const [state, dispatch] = useReducer(boardReducer, {
    employees: initialEmployees,
    tasks: initialTasks,
    past: [],
    future: [],
  } satisfies BoardState);
  const [timelineConfig, setTimelineConfigState] = useState(initialTimelineConfig);
  const boardRef = useRef<HTMLDivElement>(null);
  const timelineRange: TimelineRange = timelineConfig;
  const slotWidth = useTimelineWidth(boardRef, timelineConfig.endSlot - timelineConfig.startSlot);

  const stateRef = useLatest(state);
  const rangeRef = useLatest(timelineRange);
  useDropFeedback(useLatest(state.tasks), useLatest(state.employees));

  const actions = createBoardActions(() => stateRef.current, () => rangeRef.current, dispatch);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) {
          e.preventDefault();
          actions.redo();
        } else {
          e.preventDefault();
          actions.undo();
        }
      } else if ((e.key === 'y' || e.key === 'Y') && !isMac) {
        e.preventDefault();
        actions.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

return {
    ...state,
    slotWidth,
    timelineConfig,
    timelineRange,
    hiddenTaskCount: state.tasks.filter((task) => !isTaskVisibleInRange(task, timelineRange)).length,
    boardRef,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    setTimelineConfig: (config) => {
      if (isValidTimelineRange(config, config.unit)) setTimelineConfigState(config);
    },
    tasksForEmployee: (employeeId: string) =>
      state.tasks.filter((task) => task.employeeId === employeeId && isTaskVisibleInRange(task, timelineRange)),
    ...actions,
  };
}