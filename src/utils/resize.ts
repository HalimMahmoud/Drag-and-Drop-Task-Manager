import type { Task, TimelineRange } from '../types';
import { MIN_TASK_HOURS, isPositionValid } from './taskLayout';

export interface ResizeHandleState {
  handle: 'left' | 'right';
  startX: number;
  startDuration: number;
  startStartHour: number;
}

export interface ResizeTarget {
  newStartHour: number;
  newDuration: number;
}

const resizeRightHandle = (state: ResizeHandleState, deltaHours: number, otherTasks: Task[], timelineRange: TimelineRange): ResizeTarget | null => {
  const newDuration = Math.max(
    MIN_TASK_HOURS,
    Math.min(state.startDuration + deltaHours, timelineRange.endHour - state.startStartHour),
  );
  if (!isPositionValid(state.startStartHour, newDuration, otherTasks, timelineRange)) return null;
  return { newStartHour: state.startStartHour, newDuration };
};

const resizeLeftHandle = (state: ResizeHandleState, deltaHours: number, otherTasks: Task[], timelineRange: TimelineRange): ResizeTarget | null => {
  const rightEdge = state.startStartHour + state.startDuration;
  const newStartHour = Math.max(timelineRange.startHour, Math.min(state.startStartHour + deltaHours, rightEdge - MIN_TASK_HOURS));
  const newDuration = rightEdge - newStartHour;
  if (!isPositionValid(newStartHour, newDuration, otherTasks, timelineRange)) return null;
  return { newStartHour, newDuration };
};

export function computeResizeTarget(
  state: ResizeHandleState,
  deltaHours: number,
  otherTasks: Task[],
  timelineRange: TimelineRange,
): ResizeTarget | null {
  return state.handle === 'right'
    ? resizeRightHandle(state, deltaHours, otherTasks, timelineRange)
    : resizeLeftHandle(state, deltaHours, otherTasks, timelineRange);
}