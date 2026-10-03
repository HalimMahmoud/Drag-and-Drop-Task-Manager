import type { Task, TimelineRange } from '../types';
import { MIN_TASK_SLOTS, isPositionValid } from './taskLayout';

export interface ResizeHandleState {
  handle: 'left' | 'right';
  startX: number;
  startDurationSlot: number;
  startStartSlot: number;
}

export interface ResizeTarget {
  newStartSlot: number;
  newDurationSlot: number;
}

const resizeRightHandle = (
  state: ResizeHandleState,
  deltaSlots: number,
  otherTasks: Task[],
  range: TimelineRange,
): ResizeTarget | null => {
  const newDurationSlot = Math.max(
    MIN_TASK_SLOTS,
    Math.min(state.startDurationSlot + deltaSlots, range.endSlot - state.startStartSlot),
  );
  if (!isPositionValid(state.startStartSlot, newDurationSlot, otherTasks, range)) return null;
  return { newStartSlot: state.startStartSlot, newDurationSlot };
};

const resizeLeftHandle = (
  state: ResizeHandleState,
  deltaSlots: number,
  otherTasks: Task[],
  range: TimelineRange,
): ResizeTarget | null => {
  const rightEdge = state.startStartSlot + state.startDurationSlot;
  const newStartSlot = Math.max(
    range.startSlot,
    Math.min(state.startStartSlot + deltaSlots, rightEdge - MIN_TASK_SLOTS),
  );
  const newDurationSlot = rightEdge - newStartSlot;
  if (!isPositionValid(newStartSlot, newDurationSlot, otherTasks, range)) return null;
  return { newStartSlot, newDurationSlot };
};

export function computeResizeTarget(
  state: ResizeHandleState,
  deltaSlots: number,
  otherTasks: Task[],
  range: TimelineRange,
): ResizeTarget | null {
  return state.handle === 'right'
    ? resizeRightHandle(state, deltaSlots, otherTasks, range)
    : resizeLeftHandle(state, deltaSlots, otherTasks, range);
}