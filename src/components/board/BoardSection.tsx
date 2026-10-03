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
          '--slot-width': `${board.slotWidth}px`,
          '--timeline-slots': String(board.timelineConfig.endSlot - board.timelineConfig.startSlot),
        } as CSSProperties}
      >
        <TimeHeader timelineConfig={board.timelineConfig} />
        {board.employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-b border-border/40 bg-card/20">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground">No team members yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {supervisorMode
                ? 'Click "Add Employee" in the top bar to add your first member and start scheduling tasks.'
                : 'This board is currently empty. Switch to Supervisor mode or log in to add team members.'}
            </p>
          </div>
        ) : (
          board.employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              tasks={board.tasksForEmployee(employee.id)}
              timelineConfig={board.timelineConfig}
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
          ))
        )}
      </div>
    </section>
  );
}