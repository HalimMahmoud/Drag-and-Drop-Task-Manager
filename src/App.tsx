import { useState, type CSSProperties } from 'react';
import { EMPLOYEES, INITIAL_TASKS } from './utils/board';
import Header from './components/Header';
import TimeHeader from './components/TimeHeader';
import EmployeeRow from './components/EmployeeRow';
import { EditTaskDialog } from './components/EditTaskDialog';
import { EditEmployeeDialog } from './components/EditEmployeeDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { useTaskBoard } from './hooks/useTaskBoard';
import type { Employee, Task } from './types';

export default function App() {
  const {
    employees,
    hourWidth,
    boardRef,
    placeTask,
    reorderEmployees,
    resizeTask,
    tasksForEmployee,
    updateTask,
    deleteTask,
    updateEmployee,
    deleteEmployee,
  } = useTaskBoard(EMPLOYEES, INITIAL_TASKS);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  return (
    <main className="app">
      <Header />

      <section className="board-shell">
        <div ref={boardRef} className="board" style={{ '--hour-width': `${hourWidth}px` } as CSSProperties}>
          <TimeHeader />
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              tasks={tasksForEmployee(employee.id)}
              onPlaceTask={placeTask}
              onReorderRow={reorderEmployees}
              onResizeTask={resizeTask}
              onEditTask={setEditingTask}
              onDeleteTask={setDeletingTask}
              onEditEmployee={setEditingEmployee}
              onDeleteEmployee={setDeletingEmployee}
            />
          ))}
        </div>
      </section>

      {editingTask && (
        <EditTaskDialog
          key={editingTask.id}
          task={editingTask}
          open={true}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSave={(updates) => {
            updateTask(editingTask.id, updates);
            setEditingTask(null);
          }}
        />
      )}

      {editingEmployee && (
        <EditEmployeeDialog
          key={editingEmployee.id}
          employee={editingEmployee}
          open={true}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          onSave={(updates) => {
            updateEmployee(editingEmployee.id, updates);
            setEditingEmployee(null);
          }}
        />
      )}

      {deletingTask && (
        <DeleteConfirmDialog
          title="Delete Task"
          description={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
          open={true}
          onOpenChange={(open) => !open && setDeletingTask(null)}
          onConfirm={() => {
            deleteTask(deletingTask.id);
            setDeletingTask(null);
          }}
        />
      )}

      {deletingEmployee && (
        <DeleteConfirmDialog
          title="Delete Employee"
          description={`Are you sure you want to delete "${deletingEmployee.name}"? This action will also remove all their tasks. This action cannot be undone.`}
          open={true}
          onOpenChange={(open) => !open && setDeletingEmployee(null)}
          onConfirm={() => {
            deleteEmployee(deletingEmployee.id);
            setDeletingEmployee(null);
          }}
        />
      )}
    </main>
  );
}
