import { createClient } from './client';
import { nanoid } from 'nanoid';
import { taskIdGenerator } from '@/utils/taskLayout';
import { slugify } from '@/utils/slugify';
import { normalizeTimelineConfig } from '@/utils/timelineConfig';
import { getDefaultTimelineConfig, getMaxSlots, hoursToSlots, slotsToHours } from '@/utils/timeUnits';
import type { Employee, Task, TimeUnit, TimelineConfig } from '@/types';

export interface DashboardData {
  id: string;
  owner_id: string;
  title: string;
  config: TimelineConfig;
  is_public: boolean;
  employees: Employee[];
  tasks: Task[];
}

export async function getDashboard(dashboardId: string): Promise<DashboardData | null> {
  const supabase = createClient();

  // 1. Fetch dashboard record
  const { data: dashboard, error: dbError } = await supabase
    .from('dashboards')
    .select('*')
    .eq('id', dashboardId)
    .maybeSingle();

  if (dbError || !dashboard) {
    return null;
  }

  // Legacy rows may still carry startHour/endHour and no unit; normalize before use.
  const config = normalizeTimelineConfig(dashboard.config);

  // 2. Fetch employees
  const { data: employeesData } = await supabase
    .from('employees')
    .select('*')
    .eq('dashboard_id', dashboardId)
    .order('position_order', { ascending: true });

  // 3. Fetch tasks
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('dashboard_id', dashboardId);

  const employees: Employee[] = (employeesData || []).map((e) => ({
    id: e.id,
    name: e.name,
    role: e.role || 'Member',
    color: e.color,
  }));

  const tasks: Task[] = (tasksData || []).map((t) => ({
    id: t.id,
    employeeId: t.employee_id,
    title: t.title,
    description: t.description || '',
    priority: t.priority || 'Medium',
    // Pre-migration rows only have hour columns; convert them into the board's unit.
    startSlot:
      t.start_slot ?? hoursToSlots(Number(t.start_hour), config.unit),
    durationSlot:
      t.duration_slot ?? hoursToSlots(Number(t.duration_hours), config.unit),
    color: t.color,
  }));

  return {
    id: dashboard.id,
    owner_id: dashboard.owner_id,
    title: dashboard.title,
    config,
    is_public: dashboard.is_public ?? true,
    employees,
    tasks,
  };
}

export async function createDashboard(
  title: string,
  ownerId: string,
  config: TimelineConfig = getDefaultTimelineConfig('hours')
): Promise<{ success: boolean; dashboardId?: string; error?: string }> {
  const supabase = createClient();
  const slug = slugify(title);
  const dashboardId = slug || nanoid(10);
  const timelineConfig = normalizeTimelineConfig(config);

  // Check if slug already exists
  const { data: existing } = await supabase
    .from('dashboards')
    .select('id')
    .eq('id', dashboardId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'A board with that URL already exists. Please choose a different title.' };
  }

  // 1. Insert dashboard
  const { error: dashError } = await supabase.from('dashboards').insert({
    id: dashboardId,
    owner_id: ownerId,
    title,
    config: timelineConfig,
    is_public: true,
  });

  if (dashError) {
    return { success: false, error: explainWriteError(dashError, 'board') };
  }

  // 2. Insert one dummy employee
  const dummyEmployeeId = nanoid(8);
  const { error: empError } = await supabase.from('employees').insert({
    id: dummyEmployeeId,
    dashboard_id: dashboardId,
    name: 'Team Member',
    role: 'Member',
    color: 'blue',
    position_order: 0,
  });

  if (empError) {
    await supabase.from('dashboards').delete().eq('id', dashboardId);
    return { success: false, error: explainWriteError(empError, 'initial employee') };
  }

  // 3. Insert one dummy task using taskIdGenerator
  const { error: taskError } = await supabase.from('tasks').insert({
    id: taskIdGenerator(),
    dashboard_id: dashboardId,
    employee_id: dummyEmployeeId,
    title: 'Welcome Task',
    description: 'Edit or delete this task to get started',
    priority: 'Medium',
    start_slot: timelineConfig.startSlot,
    duration_slot: 1,
    start_hour: slotsToHours(timelineConfig.startSlot, timelineConfig.unit),
    duration_hours: slotsToHours(1, timelineConfig.unit),
    color: 'blue',
  });

  if (taskError) {
    await supabase.from('employees').delete().eq('dashboard_id', dashboardId);
    await supabase.from('dashboards').delete().eq('id', dashboardId);
    return { success: false, error: explainWriteError(taskError, 'initial task') };
  }

  return { success: true, dashboardId };
}

/**
 * Turns a PostgREST error into something actionable.
 *
 * A missing column or table surfaces as "Could not find the 'x' column of 'y' in the
 * schema cache", which is almost always an unapplied migration rather than bad data.
 * PostgREST also caches the schema, so the fix needs a reload after running the SQL.
 */
function explainWriteError(error: { message: string }, subject: string): string {
  const message = error.message ?? '';

  const missingSchema =
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('Could not find');

  if (!missingSchema) return `Failed to insert ${subject}: ${message}`;

  return (
    `Could not write the ${subject} because the database schema is out of date. ` +
    'Run supabase/migrations/001_initial_schema.sql followed by ' +
    'supabase/migrations/002_time_plans.sql in the Supabase SQL Editor, then ' +
    'reload the page so PostgREST picks up the new columns.'
  );
}

/**
 * Removes rows belonging to this dashboard that are no longer present in client state.
 * Without this, deleting a task/employee only removed it locally and it reappeared on reload.
 */
async function deleteRowsMissingFrom(
  supabase: ReturnType<typeof createClient>,
  table: 'employees' | 'tasks',
  dashboardId: string,
  keepIds: string[]
): Promise<void> {
  let query = supabase.from(table).delete().eq('dashboard_id', dashboardId);

  // An empty keep-list means "nothing survives", so drop every row for this dashboard.
  query = keepIds.length > 0 ? query.not('id', 'in', `(${keepIds.join(',')})`) : query;

  const { error } = await query;
  if (error) console.error(`Failed to prune ${table} for ${dashboardId}:`, error);
}

export async function saveDashboardData(
  dashboardId: string,
  employees: Employee[],
  tasks: Task[],
  config: TimelineConfig
): Promise<void> {
  const supabase = createClient();
  const timelineConfig = normalizeTimelineConfig(config);
  const unit = timelineConfig.unit;

  // Update config
  await supabase
    .from('dashboards')
    .update({ config: timelineConfig, updated_at: new Date().toISOString() })
    .eq('id', dashboardId);

  // Sync employees: upsert employees
  if (employees.length > 0) {
    const empRows = employees.map((e, idx) => ({
      id: e.id,
      dashboard_id: dashboardId,
      name: e.name,
      role: e.role,
      color: e.color,
      position_order: idx,
    }));
    await supabase.from('employees').upsert(empRows);
  }

  // Sync tasks: upsert slots as the canonical coordinates and keep the hour mirror in step.
  if (tasks.length > 0) {
    const taskRows = tasks.map((t) => ({
      id: t.id,
      dashboard_id: dashboardId,
      employee_id: t.employeeId,
      title: t.title,
      description: t.description,
      priority: t.priority,
      start_slot: t.startSlot,
      duration_slot: t.durationSlot,
      start_hour: slotsToHours(t.startSlot, unit),
      duration_hours: slotsToHours(t.durationSlot, unit),
      color: t.color,
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('tasks').upsert(taskRows);
  }

  // Prune removed rows. Tasks go first because tasks reference employees.
  await deleteRowsMissingFrom(supabase, 'tasks', dashboardId, tasks.map((t) => t.id));
  await deleteRowsMissingFrom(supabase, 'employees', dashboardId, employees.map((e) => e.id));
}

export interface DashboardSummary {
  id: string;
  title: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  employee_count: number;
  task_count: number;
}

export async function getAllDashboards(): Promise<DashboardSummary[]> {
  const supabase = createClient();

  const { data: dashboards, error: dashError } = await supabase
    .from('dashboards')
    .select('id, title, owner_id, is_public, created_at')
    .order('created_at', { ascending: false });

  if (dashError || !dashboards) {
    console.error('Error fetching all dashboards:', dashError);
    return [];
  }

  // Fetch count metadata
  const { data: employees } = await supabase.from('employees').select('dashboard_id');
  const { data: tasks } = await supabase.from('tasks').select('dashboard_id');

  const empCounts: Record<string, number> = {};
  employees?.forEach((e) => {
    empCounts[e.dashboard_id] = (empCounts[e.dashboard_id] || 0) + 1;
  });

  const taskCounts: Record<string, number> = {};
  tasks?.forEach((t) => {
    taskCounts[t.dashboard_id] = (taskCounts[t.dashboard_id] || 0) + 1;
  });

  return dashboards.map((d) => ({
    id: d.id,
    title: d.title,
    owner_id: d.owner_id,
    is_public: d.is_public ?? true,
    created_at: d.created_at,
    employee_count: empCounts[d.id] || 0,
    task_count: taskCounts[d.id] || 0,
  }));
}

export async function getUserDashboards(ownerId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('dashboards')
    .select('id, title, is_public, created_at')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function deleteDashboard(dashboardId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('dashboards').delete().eq('id', dashboardId);
  return !error;
}

/**
 * Re-plans a board onto a different granularity.
 *
 * Existing task slots are reinterpreted through absolute hours so a task sitting at
 * hour 30 keeps its position when the board switches from hours to days (30h -> day 2).
 *
 * Coarsening the unit can destroy tasks, and it is done deliberately rather than
 * clamped, because a clamped task would silently overlap a neighbour:
 *   * a task that no longer fits inside the new unit's capacity is removed;
 *   * a task that would collide with an already-re-anchored sibling is removed,
 *     since rounding several hour-scale tasks onto one day-slot is unavoidable.
 */
async function changeBoardUnit(
  dashboardId: string,
  nextUnit: TimeUnit
): Promise<{ success: boolean; error?: string; droppedTasks?: number }> {
  const supabase = createClient();

  const { data: dashboard } = await supabase
    .from('dashboards')
    .select('config')
    .eq('id', dashboardId)
    .maybeSingle();

  if (!dashboard) return { success: false, error: 'Board not found.' };

  const currentConfig = normalizeTimelineConfig(dashboard.config);
  if (currentConfig.unit === nextUnit) return { success: true };

  const nextConfig = getDefaultTimelineConfig(nextUnit);

  const { error: updateError } = await supabase
    .from('dashboards')
    .update({ config: nextConfig, updated_at: new Date().toISOString() })
    .eq('id', dashboardId);

  if (updateError) return { success: false, error: updateError.message };

  // Re-anchor surviving tasks onto the new grid.
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, employee_id, start_slot, start_hour, duration_slot, duration_hours')
    .eq('dashboard_id', dashboardId);

  const maxSlot = getMaxSlots(nextUnit);
  const occupiedByEmployee = new Map<string, Array<[number, number]>>();

  const converted = (tasks ?? [])
    .map((t) => {
      // Prefer canonical slots; fall back to the hour columns for pre-migration rows.
      const absoluteStartHours =
        t.start_slot != null ? slotsToHours(t.start_slot, currentConfig.unit) : Number(t.start_hour);
      const absoluteDurationHours =
        t.duration_slot != null ? slotsToHours(t.duration_slot, currentConfig.unit) : Number(t.duration_hours);

      const startSlot = hoursToSlots(absoluteStartHours, nextUnit);
      const durationSlot = Math.max(1, hoursToSlots(absoluteDurationHours, nextUnit));
      const endSlot = startSlot + durationSlot;

      if (startSlot < 0 || endSlot > maxSlot) return null;

      const occupied = occupiedByEmployee.get(t.employee_id) ?? [];
      const collides = occupied.some(([start, end]) => startSlot < end && endSlot > start);
      if (collides) return null;

      occupied.push([startSlot, endSlot]);
      occupiedByEmployee.set(t.employee_id, occupied);

      return {
        id: t.id,
        start_slot: startSlot,
        duration_slot: durationSlot,
        start_hour: slotsToHours(startSlot, nextUnit),
        duration_hours: slotsToHours(durationSlot, nextUnit),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const dropped = (tasks?.length ?? 0) - converted.length;
  if (dropped > 0) {
    const keep = converted.map((row) => row.id);
    const prune = keep.length
      ? supabase.from('tasks').delete().eq('dashboard_id', dashboardId).not('id', 'in', `(${keep.join(',')})`)
      : supabase.from('tasks').delete().eq('dashboard_id', dashboardId);
    await prune;
  }

  if (converted.length > 0) {
    for (const row of converted) {
      const { error } = await supabase
        .from('tasks')
        .update(row)
        .eq('id', row.id);
      if (error) return { success: false, error: error.message };
    }
  }

  return { success: true, ...(dropped > 0 ? { droppedTasks: dropped } : {}) };
}

export async function updateDashboard(
  dashboardId: string,
  updates: { title?: string; newId?: string; unit?: TimeUnit }
): Promise<{ success: boolean; error?: string; droppedTasks?: number }> {
  const supabase = createClient();

  // Re-planning happens before any rename so the new dashboard id is inserted with
  // the updated config already in place.
  let droppedTasks = 0;
  if (updates.unit) {
    const result = await changeBoardUnit(dashboardId, updates.unit);
    if (!result.success) return result;
    droppedTasks = result.droppedTasks ?? 0;
  }

  // If renaming the slug, we need to update the dashboard ID and cascade to children
  if (updates.newId && updates.newId !== dashboardId) {
    // Check if new ID already exists
    const { data: existing } = await supabase
      .from('dashboards')
      .select('id')
      .eq('id', updates.newId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'A board with that URL already exists.' };
    }

    // Step 1: Get current dashboard data
    const { data: currentDash } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .maybeSingle();

    if (!currentDash) {
      return { success: false, error: 'Board not found.' };
    }

    // Step 2: Insert new dashboard record first (so RLS passes for children)
    const { error: insertError } = await supabase.from('dashboards').insert({
      id: updates.newId,
      owner_id: currentDash.owner_id,
      title: updates.title || currentDash.title,
      config: currentDash.config,
      is_public: currentDash.is_public,
    });

    if (insertError) return { success: false, error: insertError.message };

    // Step 3: Update employees to point to new dashboard_id
    const { error: empError } = await supabase
      .from('employees')
      .update({ dashboard_id: updates.newId })
      .eq('dashboard_id', dashboardId);
    if (empError) {
      await supabase.from('dashboards').delete().eq('id', updates.newId);
      return { success: false, error: empError.message };
    }

    // Step 4: Update tasks to point to new dashboard_id
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ dashboard_id: updates.newId })
      .eq('dashboard_id', dashboardId);
    if (taskError) {
      await supabase.from('employees').update({ dashboard_id: dashboardId }).eq('dashboard_id', updates.newId);
      await supabase.from('dashboards').delete().eq('id', updates.newId);
      return { success: false, error: taskError.message };
    }

    // Step 5: Delete the old dashboard record
    const { error: deleteError } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', dashboardId);

    if (deleteError) return { success: false, error: deleteError.message };

    return { success: true, ...(droppedTasks > 0 ? { droppedTasks } : {}) };
  }

  // Just update the title
  const { error } = await supabase
    .from('dashboards')
    .update({
      title: updates.title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dashboardId);

  if (error) return { success: false, error: error.message };
  return { success: true, ...(droppedTasks > 0 ? { droppedTasks } : {}) };
}

