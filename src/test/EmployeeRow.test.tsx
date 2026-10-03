import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Employee, Task, TimelineConfig } from '../types';
import EmployeeRow from '../components/board/EmployeeRow';

const employee: Employee = { id: 'e1', name: 'Alice', role: 'Frontend Developer', color: 'blue' };
const config: TimelineConfig = { unit: 'hours', startSlot: 0, endSlot: 12 };
const tasks: Task[] = [
  { id: 't1', employeeId: 'e1', title: 'Login page', priority: 'High', durationSlot: 2, startSlot: 0, color: 'red' },
  { id: 't2', employeeId: 'e1', title: 'Dashboard', priority: 'Low', durationSlot: 2, startSlot: 4, color: 'orange' },
];

const noop = vi.fn();

const renderRow = (overrides: Partial<Parameters<typeof EmployeeRow>[0]> = {}) =>
  render(
    <EmployeeRow
      employee={employee}
      tasks={tasks}
      onPlaceTask={noop}
      onReorderRow={noop}
      onResizeTask={noop}
      onEditTask={noop}
      onDeleteTask={noop}
      onAddTask={noop}
      onEditEmployee={noop}
      onDeleteEmployee={noop}
      supervisorMode={false}
      timelineConfig={config}
      {...overrides}
    />,
  );

const rowDropTarget = () => vi.mocked(dropTargetForElements).mock.calls.at(-2)?.[0];
const taskDropTarget = () => vi.mocked(dropTargetForElements).mock.calls.at(-1)?.[0];

const rowSource = { data: { type: 'row', employeeId: 'e2' } };
const taskSource = {
  data: { type: 'task', taskId: 't1', employeeId: 'e1', startSlot: 0, durationSlot: 2, dragOffsetX: 0 },
};

describe('EmployeeRow: rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the employee identity block', () => {
    renderRow();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Frontend Developer')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('renders every task card in the task area', () => {
    renderRow();
    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders no action menus outside supervisor mode', () => {
    renderRow();
    expect(screen.queryByRole('button', { name: 'Actions' })).toBeNull();
  });

  it('shows an action menu per task and one for the employee in supervisor mode', () => {
    renderRow({ supervisorMode: true });
    expect(screen.getAllByRole('button', { name: 'Actions' }).length).toBe(3);
  });

  it('uses the employee color as the avatar border', () => {
    const { container } = renderRow();
    const avatar = container.querySelector('div[data-slot="avatar"]') as HTMLElement;
    expect(avatar).toBeDefined();
    // blue palette color has border #2563eb (rgb(37, 99, 235))
    expect(avatar.style.borderColor).toBe('rgb(37, 99, 235)');
  });

  it('renders an empty task area without crash when no tasks exist', () => {
    renderRow({ tasks: [] });
    expect(screen.queryByText('Login page')).toBeNull();
  });
});

describe('EmployeeRow: row drop targets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers row and task drop targets only in supervisor mode', () => {
    renderRow();
    expect(vi.mocked(dropTargetForElements)).not.toHaveBeenCalled();

    renderRow({ supervisorMode: true });
    expect(vi.mocked(dropTargetForElements).mock.calls.length).toBe(2);
  });

  it('highlights the row while a row is dragged over it', () => {
    const { container } = renderRow({ supervisorMode: true });

    act(() => rowDropTarget()?.onDragEnter?.({ source: rowSource, self: { data: {} } } as never));
    expect(container.querySelector('.employee-row')?.className).toContain('employee-row--over');

    act(() => rowDropTarget()?.onDragLeave?.({} as never));
    expect(container.querySelector('.employee-row')?.className).not.toContain('employee-row--over');
  });

  it('renders the closest-edge visual when hovering the top edge', () => {
    const { container } = renderRow({ supervisorMode: true });
    vi.mocked(extractClosestEdge).mockReturnValueOnce('top');

    act(() => rowDropTarget()?.onDragEnter?.({ source: rowSource, self: { data: {} } } as never));
    expect(container.querySelector('.employee-row')?.className).toContain('employee-row--edge-top');
  });

  it('reorders the row when a row is dropped on it', () => {
    const onReorderRow = vi.fn();
    renderRow({ supervisorMode: true, onReorderRow });

    act(() => rowDropTarget()?.onDrop?.({ source: rowSource, self: { data: {} } } as never));
    expect(onReorderRow).toHaveBeenCalledWith('e2', 'e1', null);
  });
});

describe('EmployeeRow: task drop targets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('places a task at the target slot announced by the drop data', () => {
    const onPlaceTask = vi.fn();
    renderRow({ supervisorMode: true, onPlaceTask });

    act(() => taskDropTarget()?.onDrop?.({ source: taskSource, self: { data: { targetStartSlot: 10 } } } as never));
    expect(onPlaceTask).toHaveBeenCalledWith('t1', 'e1', 10);
  });

  it('keeps the drop indicator while dragging over the task area', () => {
    const { container } = renderRow({ supervisorMode: true });

    act(() => taskDropTarget()?.onDragEnter?.({ source: taskSource, self: { data: { targetStartSlot: 10 } } } as never));
    expect(container.querySelector('.drop-indicator')).toBeDefined();
    expect((container.querySelector('.drop-indicator') as HTMLElement).style.left).toBe('83.33333333333334%');

    act(() => taskDropTarget()?.onDragLeave?.({} as never));
    expect(container.querySelector('.drop-indicator')).toBeNull();
  });

  it('rejects a task drop without a valid target slot', () => {
    const onPlaceTask = vi.fn();
    renderRow({ supervisorMode: true, onPlaceTask });

    act(() => taskDropTarget()?.onDrop?.({ source: taskSource, self: { data: { targetStartSlot: null } } } as never));
    expect(onPlaceTask).not.toHaveBeenCalled();
  });

  it('computes the drop canDrop/getData based on the pointer position', () => {
    renderRow({ supervisorMode: true });
    const input = { clientX: 400 } as never;
    const element = { getBoundingClientRect: () => ({ width: 400, left: 0 }) } as never;

    const canDrop = taskDropTarget()?.canDrop?.({ input, source: taskSource, element } as never);
    const data = taskDropTarget()?.getData?.({ input, source: taskSource, element } as never) as { targetStartSlot: number | null };

    expect(canDrop).toBe(true);
    expect(data.targetStartSlot).toBe(10);
  });
});