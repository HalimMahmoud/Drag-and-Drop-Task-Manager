import { createClient } from './client';
import type { Employee, Task, TimelineRange } from '@/types';

export interface DashboardData {
  id: string;
  owner_id: string;
  title: string;
  config: TimelineRange;
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
    startHour: Number(t.start_hour),
    durationHours: Number(t.duration_hours),
    color: t.color,
  }));

  return {
    id: dashboard.id,
    owner_id: dashboard.owner_id,
    title: dashboard.title,
    config: dashboard.config || { startHour: 0, endHour: 12 },
    is_public: dashboard.is_public ?? true,
    employees,
    tasks,
  };
}

export async function createDashboard(
  id: string,
  title: string,
  ownerId: string,
  seedEmployees: Employee[] = [],
  seedTasks: Task[] = [],
  config: TimelineRange = { startHour: 0, endHour: 12 }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // 1. Insert dashboard
  const { error: dashError } = await supabase.from('dashboards').insert({
    id,
    owner_id: ownerId,
    title,
    config,
    is_public: true,
  });

  if (dashError) {
    if (dashError.message?.includes('schema cache') || dashError.message?.includes('does not exist')) {
      return {
        success: false,
        error: 'Database tables not found. Please run the SQL schema in supabase/schema.sql in your Supabase SQL Editor.',
      };
    }
    return { success: false, error: dashError.message };
  }

  // 2. Insert initial employees if any
  if (seedEmployees.length > 0) {
    const empRows = seedEmployees.map((e, idx) => ({
      id: e.id,
      dashboard_id: id,
      name: e.name,
      role: e.role,
      color: e.color,
      position_order: idx,
    }));
    const { error: empError } = await supabase.from('employees').insert(empRows);
    if (empError) {
      await supabase.from('dashboards').delete().eq('id', id);
      return { success: false, error: `Failed to insert initial employees: ${empError.message}` };
    }
  }

  // 3. Insert initial tasks if any
  if (seedTasks.length > 0) {
    const taskRows = seedTasks.map((t) => ({
      id: t.id,
      dashboard_id: id,
      employee_id: t.employeeId,
      title: t.title,
      description: t.description,
      priority: t.priority,
      start_hour: t.startHour,
      duration_hours: t.durationHours,
      color: t.color,
    }));
    const { error: taskError } = await supabase.from('tasks').insert(taskRows);
    if (taskError) {
      await supabase.from('employees').delete().eq('dashboard_id', id);
      await supabase.from('dashboards').delete().eq('id', id);
      return { success: false, error: `Failed to insert initial tasks: ${taskError.message}` };
    }
  }

  return { success: true };
}

export async function saveDashboardData(
  dashboardId: string,
  employees: Employee[],
  tasks: Task[],
  config: TimelineRange
): Promise<void> {
  const supabase = createClient();

  // Update config
  await supabase
    .from('dashboards')
    .update({ config, updated_at: new Date().toISOString() })
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

  // Sync tasks: upsert tasks
  if (tasks.length > 0) {
    const taskRows = tasks.map((t) => ({
      id: t.id,
      dashboard_id: dashboardId,
      employee_id: t.employeeId,
      title: t.title,
      description: t.description,
      priority: t.priority,
      start_hour: t.startHour,
      duration_hours: t.durationHours,
      color: t.color,
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('tasks').upsert(taskRows);
  }
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

