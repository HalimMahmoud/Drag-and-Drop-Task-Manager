import { createClient } from './server';
import type { EmployeeInsert, EmployeeUpdate, TaskInsert, TaskUpdate, Employee, Task } from './types';

export async function getEmployees(): Promise<Employee[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createEmployee(employee: EmployeeInsert): Promise<Employee> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmployee(id: string, updates: EmployeeUpdate): Promise<Employee> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('employees')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

export async function createTask(task: TaskInsert): Promise<Task> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function moveTask(id: string, employeeId: string, startHour: number): Promise<Task> {
  return updateTask(id, { employee_id: employeeId, start_hour: startHour });
}

export async function resizeTask(id: string, durationHours: number, startHour: number): Promise<Task> {
  return updateTask(id, { duration_hours: durationHours, start_hour: startHour });
}

export async function reorderEmployees(employeeIds: string[]): Promise<void> {
  const supabase = createClient();
  // Update order by using a transaction-like approach with position field
  // For simplicity, we'll update each employee with a position
  for (let i = 0; i < employeeIds.length; i++) {
    const { error } = await supabase
      .from('employees')
      .update({ position: i, updated_at: new Date().toISOString() })
      .eq('id', employeeIds[i]);
    if (error) throw error;
  }
}