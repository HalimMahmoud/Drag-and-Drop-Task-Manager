import type { CSSProperties } from 'react';
import type { UseTaskBoardReturn } from '../../hooks/board/useTaskBoard';
import type { Employee, Task } from '../../types';
import TimeHeader from './TimeHeader';
import EmployeeRow from './EmployeeRow';

interface BoardSectionProps {
  board: UseTaskBoardReturn;
  supervisorMode: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTask: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
}

export default function BoardSection({
  board,
  supervisorMode,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onEditEmployee,
  onDeleteEmployee,
}: BoardSectionProps) {
  return (
    <section className="board-shell">
      <div
        ref={board.boardRef}
        className="board"
        style={{
          '--hour-width': `${board.hourWidth}px`,
          '--timeline-hours': String(board.timelineRange.endHour - board.timelineRange.startHour),
        } as CSSProperties}
      >
        <TimeHeader timelineRange={board.timelineRange} />
        {board.employees.map((employee) => (
          <EmployeeRow
            key={employee.id}
            employee={employee}
            tasks={board.tasksForEmployee(employee.id)}
            timelineRange={board.timelineRange}
            onPlaceTask={board.placeTask}
            onReorderRow={board.reorderEmployees}
            onResizeTask={board.resizeTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onAddTask={onAddTask}
            onEditEmployee={onEditEmployee}
            onDeleteEmployee={onDeleteEmployee}
            supervisorMode={supervisorMode}
          />
        ))}
      </div>
    </section>
  );
}