import { describe, expect, it, vi, beforeEach } from 'vitest';
import { saveDashboardData, updateDashboard } from '@/lib/supabase/dashboards';
import type { Employee, Task } from '@/types';

interface Recorded {
  table: string;
  op: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
  payload: unknown;
  eq: [string, unknown][];
  notIn: [string, string][];
}

const calls: Recorded[] = [];

/** A persisted row as the fake Supabase client stores it. */
type DbRow = Record<string, unknown>;

/** Stateful fake so read-modify-write flows (re-planning a board) are exercised
 * against the rows the function actually read back. Shared with the client mock. */
const fake = vi.hoisted(() => ({
  state: {
    dashboards: [] as Record<string, unknown>[],
    employees: [] as Record<string, unknown>[],
    tasks: [] as Record<string, unknown>[],
  },
}));

vi.mock('@/lib/supabase/client', () => {
  const state = fake.state;

  const matches = (row: Record<string, unknown>, filters: [string, unknown][]) =>
    filters.every(([column, value]) => row[column] === value);

  const parseInFilter = (value: string) =>
    value.replace(/[()]/g, '').split(',').filter(Boolean);

  const createClient = () => ({
    from: (table: string) => {
      const recorded: Recorded = { table, op: 'select', payload: undefined, eq: [], notIn: [] };
      calls.push(recorded);

      let filters: [string, unknown][] = [];
      let payload: unknown;
      let mode: Recorded['op'] = 'select';
      let negated: [string, string] | null = null;

      const rows = () => state[table as keyof typeof state];

      const node = {
        select: () => {
          mode = 'select';
          return node;
        },
        insert: (value: unknown) => {
          mode = 'insert';
          payload = value;
          return node;
        },
        update: (value: unknown) => {
          mode = 'update';
          payload = value;
          return node;
        },
        upsert: (value: unknown) => {
          mode = 'upsert';
          payload = value;
          return node;
        },
        delete: () => {
          mode = 'delete';
          return node;
        },
        eq: (column: string, value: unknown) => {
          filters.push([column, value]);
          return node;
        },
        not: (column: string, _operator: string, value: string) => {
          negated = [column, value];
          return node;
        },
        maybeSingle: async () => ({
          data: rows().find((row) => matches(row, filters)) ?? null,
          error: null,
        }),
        then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) => {
          let result: { data: unknown; error: unknown } = { data: null, error: null };

          if (mode === 'select') {
            result = { data: rows().filter((row) => matches(row, filters)), error: null };
          } else if (mode === 'insert') {
            rows().push({ ...(payload as Record<string, unknown>) });
          } else if (mode === 'update') {
            for (const row of rows()) {
              if (matches(row, filters)) Object.assign(row, payload);
            }
          } else if (mode === 'upsert') {
            for (const row of payload as Record<string, unknown>[]) {
              const index = rows().findIndex((existing) => existing.id === row.id);
              if (index >= 0) rows()[index] = { ...rows()[index], ...row };
              else rows().push({ ...row });
            }
          } else if (mode === 'delete') {
            const kept = negated ? parseInFilter(negated[1]) : ([] as string[]);
            state[table as keyof typeof state] = rows().filter(
              (row) => !(matches(row, filters) && !kept.includes(row.id as string))
            );
          }

          recorded.op = mode;
          recorded.payload = payload;
          recorded.eq = filters;
          if (negated) recorded.notIn = [negated];

          return Promise.resolve(result).then(resolve, reject);
        },
      };

      return node;
    },
  });

  return { createClient };
});

const employee = (id: string): Employee => ({
  id,
  name: `Person ${id}`,
  role: 'Member',
  color: 'blue',
});

const task = (id: string, employeeId: string): Task => ({
  id,
  employeeId,
  title: `Task ${id}`,
  description: '',
  priority: 'Medium',
  startSlot: 0,
  durationSlot: 1,
  color: 'blue',
});

const find = (table: string, op: Recorded['op']) =>
  calls.filter((c) => c.table === table && c.op === op);

beforeEach(() => {
  calls.length = 0;
  fake.state.dashboards = [];
  fake.state.employees = [];
  fake.state.tasks = [];
});

describe('saveDashboardData', () => {
  it('persists the timeline config to the dashboard row', async () => {
    await saveDashboardData('board', [employee('a')], [task('t1', 'a')], { unit: 'hours', startSlot: 9, endSlot: 17 });

    const [update] = find('dashboards', 'update');
    expect(update.payload).toMatchObject({ config: { unit: 'hours', startSlot: 9, endSlot: 17 } });
    expect(update.eq).toEqual([['id', 'board']]);
  });

  it('upserts the current employees and tasks', async () => {
    await saveDashboardData('board', [employee('a'), employee('b')], [task('t1', 'a')], {
      unit: 'hours',
      startSlot: 0,
      endSlot: 12,
    });

    expect(find('employees', 'upsert')[0].payload).toHaveLength(2);
    expect(find('tasks', 'upsert')[0].payload).toHaveLength(1);
  });

  it('deletes tasks that are no longer in board state', async () => {
    await saveDashboardData('board', [employee('a')], [task('keep', 'a')], {
      unit: 'hours',
      startSlot: 0,
      endSlot: 12,
    });

    const [prune] = find('tasks', 'delete');
    expect(prune.eq).toEqual([['dashboard_id', 'board']]);
    expect(prune.notIn).toEqual([['id', '(keep)']]);
  });

  it('deletes employees that are no longer in board state', async () => {
    await saveDashboardData('board', [employee('keep')], [], { unit: 'hours', startSlot: 0, endSlot: 12 });

    const [prune] = find('employees', 'delete');
    expect(prune.eq).toEqual([['dashboard_id', 'board']]);
    expect(prune.notIn).toEqual([['id', '(keep)']]);
  });

  it('keeps every surviving id in the prune filter', async () => {
    await saveDashboardData(
      'board',
      [employee('a'), employee('b')],
      [task('t1', 'a'), task('t2', 'b')],
      { unit: 'hours', startSlot: 0, endSlot: 12 }
    );

    expect(find('employees', 'delete')[0].notIn[0][1]).toBe('(a,b)');
    expect(find('tasks', 'delete')[0].notIn[0][1]).toBe('(t1,t2)');
  });

  it('deletes every row of a table when nothing survives in state', async () => {
    await saveDashboardData('board', [], [], { unit: 'hours', startSlot: 0, endSlot: 12 });

    // No id filter means "drop all rows for this dashboard".
    expect(find('tasks', 'delete')[0].notIn).toEqual([]);
    expect(find('employees', 'delete')[0].notIn).toEqual([]);
  });

it('prunes tasks before employees so the employee foreign key stays valid', async () => {
    await saveDashboardData('board', [], [], { unit: 'hours', startSlot: 0, endSlot: 12 });

    const order = calls.filter((c) => c.op === 'delete').map((c) => c.table);
    expect(order).toEqual(['tasks', 'employees']);
  });

  it('writes the hour mirror alongside the canonical slots', async () => {
    await saveDashboardData('board', [employee('a')], [{ ...task('t1', 'a'), startSlot: 2, durationSlot: 3 }], {
      unit: 'days',
      startSlot: 0,
      endSlot: 14,
    });

    expect((find('tasks', 'upsert')[0].payload as Record<string, unknown>[])[0]).toMatchObject({
      start_slot: 2,
      duration_slot: 3,
      start_hour: 48,
      duration_hours: 72,
    });
  });

  it('keeps the hour mirror in step when the plan is in hours', async () => {
    await saveDashboardData('board', [employee('a')], [{ ...task('t1', 'a'), startSlot: 5, durationSlot: 2 }], {
      unit: 'hours',
      startSlot: 0,
      endSlot: 24,
    });

    expect((find('tasks', 'upsert')[0].payload as Record<string, unknown>[])[0]).toMatchObject({
      start_slot: 5,
      duration_slot: 2,
      start_hour: 5,
      duration_hours: 2,
    });
  });
});

describe('updateDashboard: re-planning the time unit', () => {
  const seed = (config: Record<string, unknown>, tasks: DbRow[]) => {
    fake.state.dashboards = [{ id: 'board', title: 'Board', owner_id: 'o1', config, is_public: true }];
    fake.state.tasks = tasks.map((t) => ({ ...t, dashboard_id: 'board' }));
  };

  const row = (over: Partial<DbRow> & { id: string; employee_id: string }): DbRow => ({
    start_slot: 0,
    duration_slot: 1,
    start_hour: 0,
    duration_hours: 1,
    ...over,
  });

  it('re-anchors task slots onto the new grid by absolute position', async () => {
    seed({ unit: 'hours', startSlot: 0, endSlot: 24 }, [
      row({ id: 't1', employee_id: 'a', start_slot: 30, duration_slot: 24, start_hour: 30, duration_hours: 24 }),
    ]);

    await updateDashboard('board', { unit: 'days' });

    expect(fake.state.dashboards[0].config).toMatchObject({ unit: 'days', startSlot: 0, endSlot: 31 });
    expect(fake.state.tasks[0]).toMatchObject({
      start_slot: 1,
      duration_slot: 1,
      start_hour: 24,
      duration_hours: 24,
    });
  });

  it('is a no-op when the unit already matches', async () => {
    seed({ unit: 'days', startSlot: 0, endSlot: 14 }, [row({ id: 't1', employee_id: 'a', start_slot: 3 })]);

    const result = await updateDashboard('board', { unit: 'days' });

    expect(result).toEqual({ success: true });
    expect(fake.state.tasks[0].start_slot).toBe(3);
  });

  it('drops a task that no longer fits inside the new capacity', async () => {
    seed({ unit: 'hours', startSlot: 0, endSlot: 24 }, [
      row({ id: 'keep', employee_id: 'a', start_slot: 1, duration_slot: 1 }),
      row({ id: 'late', employee_id: 'a', start_slot: 700, duration_slot: 10, start_hour: 700, duration_hours: 10 }),
    ]);

    const result = await updateDashboard('board', { unit: 'weeks' });

    // 700h lands on week 42, which is inside the 52-week capacity.
    expect(result).toEqual({ success: true });
    expect(fake.state.tasks.map((t) => t.id).sort()).toEqual(['keep', 'late']);
  });

  it('drops tasks that would collide on the coarser grid and reports the count', async () => {
    // Both tasks sit inside the same day once the plan coarsens from hours to days.
    seed({ unit: 'hours', startSlot: 0, endSlot: 24 }, [
      row({ id: 'first', employee_id: 'a', start_slot: 1, duration_slot: 2, start_hour: 1, duration_hours: 2 }),
      row({ id: 'second', employee_id: 'a', start_slot: 3, duration_slot: 2, start_hour: 3, duration_hours: 2 }),
    ]);

    const result = await updateDashboard('board', { unit: 'days' });

    expect(result).toEqual({ success: true, droppedTasks: 1 });
    expect(fake.state.tasks.map((t) => t.id)).toEqual(['first']);
  });

  it('keeps colliding tasks that belong to different employees', async () => {
    seed({ unit: 'hours', startSlot: 0, endSlot: 24 }, [
      row({ id: 'a1', employee_id: 'a', start_slot: 1, duration_slot: 2, start_hour: 1, duration_hours: 2 }),
      row({ id: 'b1', employee_id: 'b', start_slot: 3, duration_slot: 2, start_hour: 3, duration_hours: 2 }),
    ]);

    const result = await updateDashboard('board', { unit: 'days' });

    expect(result).toEqual({ success: true });
    expect(fake.state.tasks.map((t) => t.id).sort()).toEqual(['a1', 'b1']);
  });

  it('removes every task when none of them survive the re-plan', async () => {
    seed({ unit: 'hours', startSlot: 0, endSlot: 24 }, [
      row({ id: 'a', employee_id: 'e', start_slot: 0, duration_slot: 1 }),
      row({ id: 'b', employee_id: 'e', start_slot: 1, duration_slot: 1 }),
    ]);

    // A years plan holds 6 slots; hours 0 and 1 both round onto year 1.
    const result = await updateDashboard('board', { unit: 'years' });

    expect(result.success).toBe(true);
    expect(fake.state.tasks.map((t) => t.id)).toEqual(['a']);
  });

  it('falls back to the hour columns for pre-migration rows', async () => {
    seed({ unit: 'hours', startSlot: 0, endSlot: 24 }, [
      { id: 'legacy', employee_id: 'a', start_slot: null, duration_slot: null, start_hour: 48, duration_hours: 48 },
    ]);

    await updateDashboard('board', { unit: 'days' });

    expect(fake.state.tasks[0]).toMatchObject({ start_slot: 2, duration_slot: 2 });
  });

  it('reports an error for a board that does not exist', async () => {
    const result = await updateDashboard('missing', { unit: 'days' });

    expect(result).toEqual({ success: false, error: 'Board not found.' });
  });

  it('renames the board without disturbing the re-planned tasks', async () => {
    seed({ unit: 'hours', startSlot: 0, endSlot: 24 }, [
      row({ id: 't1', employee_id: 'a', start_slot: 30, duration_slot: 24, start_hour: 30, duration_hours: 24 }),
    ]);

    const result = await updateDashboard('board', { unit: 'days', newId: 'renamed', title: 'Renamed' });

    expect(result.success).toBe(true);
    expect(fake.state.dashboards.map((d) => d.id)).toEqual(['renamed']);
    expect(fake.state.tasks[0]).toMatchObject({ dashboard_id: 'renamed', start_slot: 1, duration_slot: 1 });
  });
});