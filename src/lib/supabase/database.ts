import { createClient } from './server';
import type { EmployeeInsert, EmployeeUpdate, TaskInsert, TaskUpdate, Employee, Task } from './types';

export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createEmployee(employee: EmployeeInsert): Promise<Employee> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmployee(id: string, updates: EmployeeUpdate): Promise<Employee> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

export async function createTask(task: TaskInsert): Promise<Task> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function moveTask(id: string, employeeId: string, startSlot: number): Promise<Task> {
  return updateTask(id, { employee_id: employeeId, start_slot: startSlot });
}

export async function resizeTask(id: string, durationSlot: number, startSlot: number): Promise<Task> {
  return updateTask(id, { duration_slot: durationSlot, start_slot: startSlot });
}

export async function reorderEmployees(employeeIds: string[]): Promise<void> {
  const supabase = await createClient();
  const updates = employeeIds.map((id, index) =>
    supabase
      .from('employees')
      .update({ position: index, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  for (const { error } of results) {
    if (error) throw error;
  }
}