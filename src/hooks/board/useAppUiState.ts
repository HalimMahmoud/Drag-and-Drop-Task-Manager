import { useState } from 'react';
import type { Employee, Task } from '../../types';

export interface AppUiState {
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  addingTaskFor: Employee | null;
  setAddingTaskFor: (employee: Employee | null) => void;
  editingEmployee: Employee | null;
  setEditingEmployee: (employee: Employee | null) => void;
  addingEmployee: boolean;
  setAddingEmployee: (open: boolean) => void;
  deletingTask: Task | null;
  setDeletingTask: (task: Task | null) => void;
  deletingEmployee: Employee | null;
  setDeletingEmployee: (employee: Employee | null) => void;
  supervisorMode: boolean;
  setSupervisorMode: (value: boolean) => void;
}

export function useAppUiState(): AppUiState {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addingTaskFor, setAddingTaskFor] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [supervisorMode, setSupervisorMode] = useState(false);

  return {
    editingTask,
    setEditingTask,
    addingTaskFor,
    setAddingTaskFor,
    editingEmployee,
    setEditingEmployee,
    addingEmployee,
    setAddingEmployee,
    deletingTask,
    setDeletingTask,
    deletingEmployee,
    setDeletingEmployee,
    supervisorMode,
    setSupervisorMode,
  };
}