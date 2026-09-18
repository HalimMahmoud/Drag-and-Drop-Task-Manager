import type { RefObject } from 'react';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import type { Employee, Task, TimelineRange } from '../../types';
import TaskCard from './TaskCard';
import EmployeeLabel from './EmployeeLabel';
import { useEmployeeRowDnd } from '../../hooks/dnd/useEmployeeRowDnd';
import { DropIndicator } from './DropIndicator';
import { cn } from '@/lib/utils';

interface EmployeeRowProps {
  employee: Employee;
  tasks: Task[];
  onPlaceTask: (taskId: string, employeeId: string, startHour: number) => void;
  onReorderRow: (sourceId: string, destinationId: string, edge: Edge | null) => void;
  onResizeTask: (taskId: string, durationHours: number, startHour: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTask: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  supervisorMode: boolean;
  timelineRange: TimelineRange;
}

interface EmployeeRowTaskAreaProps {
  taskAreaRef: RefObject<HTMLDivElement | null>;
  dropIndicatorHour: number | null;
  tasks: Task[];
  supervisorMode: boolean;
  timelineRange: TimelineRange;
  onResizeTask: (taskId: string, durationHours: number, startHour: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

const EmployeeRowTaskArea = ({
  taskAreaRef,
  dropIndicatorHour,
  tasks,
  supervisorMode,
  timelineRange,
  onResizeTask,
  onEditTask,
  onDeleteTask,
}: EmployeeRowTaskAreaProps) => (
  <div ref={taskAreaRef} className="task-area">
    {tasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        rowTasks={tasks}
        onResize={onResizeTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        supervisorMode={supervisorMode}
        timelineRange={timelineRange}
      />
    ))}

    {dropIndicatorHour !== null && <DropIndicator dropIndicatorHour={dropIndicatorHour} timelineRange={timelineRange} />}
  </div>
);

export default function EmployeeRow({
  employee,
  tasks,
  onPlaceTask,
  onReorderRow,
  onResizeTask,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onEditEmployee,
  onDeleteEmployee,
  supervisorMode,
  timelineRange,
}: EmployeeRowProps) {
  const { rowRef, dragHandleRef, taskAreaRef, isRowOver, rowEdge, dropIndicatorHour } = useEmployeeRowDnd({
    employeeId: employee.id,
    supervisorMode,
    timelineRange,
    tasks,
    onPlaceTask,
    onReorderRow,
  });

  return (
    <div
      ref={rowRef}
      className={cn(
        'employee-row',
        isRowOver && 'employee-row--over',
        rowEdge === 'top' && 'employee-row--edge-top',
        rowEdge === 'bottom' && 'employee-row--edge-bottom',
      )}
    >
      <EmployeeLabel
        employee={employee}
        supervisorMode={supervisorMode}
        dragHandleRef={dragHandleRef}
        onAdd={() => onAddTask(employee)}
        onEdit={() => onEditEmployee(employee)}
        onDelete={() => onDeleteEmployee(employee)}
      />

      <EmployeeRowTaskArea
        taskAreaRef={taskAreaRef}
        dropIndicatorHour={dropIndicatorHour}
        tasks={tasks}
        supervisorMode={supervisorMode}
        timelineRange={timelineRange}
        onResizeTask={onResizeTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}