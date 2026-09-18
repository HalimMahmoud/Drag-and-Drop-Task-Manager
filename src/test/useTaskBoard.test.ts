import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Employee, TaskDragData } from '../types';
import { useTaskBoard } from '../hooks/board/useTaskBoard';
import { EMPLOYEES, INITIAL_TASKS } from '../utils/seed';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { announce } from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  monitorForElements: vi.fn(() => () => {}),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash', () => ({
  triggerPostMoveFlash: vi.fn(),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-live-region', () => ({
  announce: vi.fn(),
  cleanup: vi.fn(),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index', () => ({
  getReorderDestinationIndex: vi.fn(
    ({ startIndex, indexOfTarget, closestEdgeOfTarget }: { startIndex: number; indexOfTarget: number; closestEdgeOfTarget: 'top' | 'bottom' | null }) =>
      closestEdgeOfTarget === 'bottom' ? Math.max(startIndex, indexOfTarget + 1) : indexOfTarget,
  ),
}));

const setup = () => renderHook(() => useTaskBoard(EMPLOYEES, INITIAL_TASKS));
const byTitle = (board: ReturnType<typeof setup>['result']['current'], title: string) =>
  board.tasks.find((t) => t.title === title);

describe('useTaskBoard: initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with the given employees and tasks', () => {
    const { result } = setup();
    expect(result.current.employees.length).toBe(EMPLOYEES.length);
    expect(result.current.tasks.length).toBe(INITIAL_TASKS.length);
  });

  it('announces a dropped task through monitorForElements', () => {
    const { result } = setup();
    const config = vi.mocked(monitorForElements).mock.calls.at(-1)?.[0];
    expect(config?.onDrop).toBeDefined();

    const login = INITIAL_TASKS.find((t) => t.title === 'Login page')!;
    const data: TaskDragData = {
      type: 'task',
      taskId: login.id,
      employeeId: login.employeeId,
      startHour: login.startHour,
      durationHours: login.durationHours,
      dragOffsetX: 0,
    };

    act(() => config?.onDrop?.({ source: { data }, self: undefined } as never));

    expect(announce).toHaveBeenCalledWith('Login page moved to Ahmed.');
    expect(triggerPostMoveFlash).not.toHaveBeenCalled();
    expect(result.current.tasks.some((t) => t.id === login.id)).toBe(true);
  });
});

describe('useTaskBoard: addTask success paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a task with a generated id and cycles to an available color', () => {
    const { result } = setup();

    let created = false;
    act(() => {
      created = result.current.addTask('ahmed', {
        title: 'New task',
        priority: 'High',
        startHour: 5,
        durationHours: 1,
      });
    });

    expect(created).toBe(true);
    const added = result.current.tasks.find((t) => t.title === 'New task');
    expect(added).toBeDefined();
    expect(added?.id).toBeTruthy();
    expect(added?.color).toBeDefined();
  });

  it('keeps a user-picked unused color instead of the palette default', () => {
    const { result } = setup();

    act(() => {
      result.current.addTask('ali', {
        title: 'Colored task',
        priority: 'Low',
        startHour: 8,
        durationHours: 1,
        color: 'violet',
      });
    });

    expect(byTitle(result.current, 'Colored task')?.color).toBe('violet');
  });
});

describe('useTaskBoard: addTask validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects tasks that overlap a sibling', () => {
    const { result } = setup();
    const dashboard = byTitle(result.current, 'Dashboard')!;

    let created = true;
    act(() => {
      created = result.current.addTask('ahmed', {
        title: 'Overlap',
        priority: 'Low',
        startHour: dashboard.startHour + 2,
        durationHours: 2,
      });
    });

    expect(created).toBe(false);
    expect(result.current.tasks.some((t) => t.title === 'Overlap')).toBe(false);
  });

  it('rejects tasks outside the visible range', () => {
    const { result } = setup();

    let created = true;
    act(() => {
      created = result.current.addTask('ahmed', {
        title: 'Too far',
        priority: 'Low',
        startHour: 20,
        durationHours: 1,
      });
    });

    expect(created).toBe(false);
  });
});

describe('useTaskBoard: placeTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('moves a task to another employee when the slot is free', () => {
    const { result } = setup();
    const login = byTitle(result.current, 'Login page')!;

    act(() => result.current.placeTask(login.id, 'ali', 6));

    const moved = result.current.tasks.find((t) => t.id === login.id);
    expect(moved?.employeeId).toBe('ali');
    expect(moved?.startHour).toBe(6);
  });

  it('leaves the task untouched when the slot is occupied', () => {
    const { result } = setup();
    const login = byTitle(result.current, 'Login page')!;

    act(() => result.current.placeTask(login.id, 'ali', 0));

    const unchanged = result.current.tasks.find((t) => t.id === login.id);
    expect(unchanged?.employeeId).toBe('ahmed');
    expect(unchanged?.startHour).toBe(0);
  });
});

describe('useTaskBoard: resizeTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resizes a task when the new span stays inside its row', () => {
    const { result } = setup();
    const dashboard = byTitle(result.current, 'Dashboard')!;

    act(() => result.current.resizeTask(dashboard.id, 3, dashboard.startHour));

    expect(result.current.tasks.find((t) => t.id === dashboard.id)?.durationHours).toBe(3);
  });

  it('rejects a resize that collides with a sibling', () => {
    const { result } = setup();
    const dashboard = byTitle(result.current, 'Dashboard')!;

    act(() => result.current.resizeTask(dashboard.id, 4, dashboard.startHour));

    expect(result.current.tasks.find((t) => t.id === dashboard.id)?.durationHours).toBe(2);
  });
});

describe('useTaskBoard: employees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds an employee and returns the created record', () => {
    const { result } = setup();

    let created: Employee | undefined;
    act(() => {
      created = result.current.addEmployee({ name: 'Sara', role: 'DevOps' });
    });

    expect(created?.id).toBeTruthy();
    expect(result.current.employees.some((e) => e.name === 'Sara')).toBe(true);
  });

  it('reorders employees with a destination edge', () => {
    const { result } = setup();
    const names = result.current.employees.map((e) => e.name);

    act(() => result.current.reorderEmployees('ahmed', 'mohamed', 'bottom'));

    const reordered = result.current.employees.map((e) => e.name);
    expect(reordered).not.toEqual(names);
    expect(reordered[0]).toBe(names[1]);
  });

  it('deleting an employee cascades to their tasks', () => {
    const { result } = setup();

    act(() => result.current.deleteEmployee('ahmed'));

    expect(result.current.employees.some((e) => e.id === 'ahmed')).toBe(false);
    expect(result.current.tasks.some((t) => t.employeeId === 'ahmed')).toBe(false);
  });
});

describe('useTaskBoard: tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a task partially', () => {
    const { result } = setup();
    const login = byTitle(result.current, 'Login page')!;

    act(() => result.current.updateTask(login.id, { title: 'Renamed' }));

    expect(result.current.tasks.find((t) => t.id === login.id)?.title).toBe('Renamed');
  });

  it('deletes a task', () => {
    const { result } = setup();
    const login = byTitle(result.current, 'Login page')!;

    act(() => result.current.deleteTask(login.id));

    expect(result.current.tasks.some((t) => t.id === login.id)).toBe(false);
  });
});

describe('useTaskBoard: timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports hidden tasks for the default range', () => {
    const { result } = setup();
    const expected = INITIAL_TASKS.filter((t) => t.startHour + t.durationHours > 12 || t.startHour < 0).length;
    expect(result.current.hiddenTaskCount).toBe(expected);
  });

  it('ignores invalid range updates', () => {
    const { result } = setup();

    act(() => result.current.setTimelineRange({ startHour: 20, endHour: 5 }));

    expect(result.current.timelineRange).toEqual({ startHour: 0, endHour: 12 });
  });

  it('applies valid range updates', () => {
    const { result } = setup();

    act(() => result.current.setTimelineRange({ startHour: 0, endHour: 24 }));

    expect(result.current.timelineRange).toEqual({ startHour: 0, endHour: 24 });
  });
});