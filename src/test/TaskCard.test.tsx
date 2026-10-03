import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task, TimelineConfig } from '../types';
import TaskCard from '../components/board/TaskCard';

const config: TimelineConfig = { unit: 'hours', startSlot: 0, endSlot: 12 };
const task: Task = {
  id: 't1',
  employeeId: 'e1',
  title: 'Build UI',
  priority: 'High',
  durationSlot: 2,
  startSlot: 3,
  color: 'red',
};
const noop = vi.fn();

const rect: DOMRect = {
  left: 0,
  top: 0,
  right: 400,
  bottom: 144,
  width: 400,
  height: 144,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

let bboxSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  bboxSpy = vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockImplementation(() => rect);
});

afterEach(() => {
  bboxSpy.mockRestore();
});

const renderCard = (overrides: Partial<Parameters<typeof TaskCard>[0]> = {}) =>
  render(
    <TaskCard
      task={task}
      rowTasks={[task]}
      onResize={noop}
      onEditTask={noop}
      onDeleteTask={noop}
      supervisorMode={false}
      timelineConfig={config}
      {...overrides}
    />,
  );

describe('TaskCard: rendering', () => {
  it('renders title, priority badge and time span', () => {
    renderCard();
    expect(screen.getByText('Build UI')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
    expect(screen.getByText('03:00\u201305:00')).toBeTruthy();
    expect(screen.getByText('#t1')).toBeTruthy();
  });

  it('exposes the task id as a data attribute', () => {
    const { container } = renderCard();
    expect(container.querySelector('[data-task-id="t1"]')).toBeDefined();
  });

  it('has no resize handles outside supervisor mode', () => {
    const { container } = renderCard();
    expect(container.querySelector('.resize-handle--left')).toBeNull();
    expect(container.querySelector('.resize-handle--right')).toBeNull();
  });

  it('shows resize handles and an action menu in supervisor mode', () => {
    const { container } = renderCard({ supervisorMode: true });
    expect(container.querySelector('.resize-handle--left')).toBeDefined();
    expect(container.querySelector('.resize-handle--right')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeTruthy();
  });
});

describe('TaskCard: resizing', () => {
  it('resizes to the right by the dragged hour delta', () => {
    const onResize = vi.fn();
    const { container } = renderCard({ supervisorMode: true, onResize });

    act(() => fireEvent.mouseDown(container.querySelector('.resize-handle--right')!, { clientX: 100 }));
    act(() => fireEvent.mouseMove(window, { clientX: 166 }));
    act(() => fireEvent.mouseUp(window));

    // hourWidth = 400 / 12 ≈ 33.3 → +2 hours → duration 2→4 at start 3
    expect(onResize).toHaveBeenCalledWith('t1', 4, 3);
  });

  it('resizes from the left by shifting the start hour', () => {
    const onResize = vi.fn();
    const { container } = renderCard({ supervisorMode: true, onResize });

    act(() => fireEvent.mouseDown(container.querySelector('.resize-handle--left')!, { clientX: 100 }));
    act(() => fireEvent.mouseMove(window, { clientX: 66 }));
    act(() => fireEvent.mouseUp(window));

    // -1 hour → start 2, duration 3 to keep the right edge at 5
    expect(onResize).toHaveBeenCalledWith('t1', 3, 2);
  });

  it('stops resizing on mouse up', () => {
    const onResize = vi.fn();
    const { container } = renderCard({ supervisorMode: true, onResize });

    act(() => fireEvent.mouseDown(container.querySelector('.resize-handle--right')!, { clientX: 100 }));
    act(() => fireEvent.mouseMove(window, { clientX: 166 }));
    act(() => fireEvent.mouseUp(window));
    act(() => fireEvent.mouseMove(window, { clientX: 200 }));

    expect(onResize).toHaveBeenCalledTimes(1);
  });
});