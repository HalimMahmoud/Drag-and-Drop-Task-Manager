import React, { type CSSProperties } from 'react';
import { EMPLOYEES, INITIAL_TASKS } from './utils/board';
import Header from './components/Header';
import TimeHeader from './components/TimeHeader';
import EmployeeRow from './components/EmployeeRow';
import { useTaskBoard } from './hooks/useTaskBoard';

export default function App() {
  const {
    employees,
    tasks,
    hourWidth,
    boardRef,
    placeTask,
    reorderEmployees,
    resizeTask,
    tasksForEmployee,
  } = useTaskBoard(EMPLOYEES, INITIAL_TASKS);

  return (
    <main className="app">
      <Header />

      <section className="board-shell">
        <div
          ref={boardRef}
          className="board"
          style={{ '--hour-width': `${hourWidth}px` } as CSSProperties}
        >
          <TimeHeader />
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              tasks={tasksForEmployee(employee.id)}
              onPlaceTask={placeTask}
              onReorderRow={reorderEmployees}
              onResizeTask={resizeTask}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
