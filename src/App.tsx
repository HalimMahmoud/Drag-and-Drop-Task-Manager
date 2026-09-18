import { EMPLOYEES, INITIAL_TASKS } from './utils/seed';
import Header from './components/header/Header';
import BoardSection from './components/board/BoardSection';
import { Dialogs } from './components/dialogs/Dialogs';
import { useTaskBoard } from './hooks/board/useTaskBoard';
import { useAppUiState } from './hooks/board/useAppUiState';

export default function App() {
  const board = useTaskBoard(EMPLOYEES, INITIAL_TASKS);
  const ui = useAppUiState();

  return (
    <main className="app">
      <Header
        supervisorMode={ui.supervisorMode}
        onSupervisorModeChange={ui.setSupervisorMode}
        onAddEmployee={() => ui.setAddingEmployee(true)}
        timelineRange={board.timelineRange}
        onTimelineRangeChange={board.setTimelineRange}
        hiddenTaskCount={board.hiddenTaskCount}
        canUndo={board.canUndo}
        canRedo={board.canRedo}
        onUndo={board.undo}
        onRedo={board.redo}
      />

      <BoardSection
        board={board}
        supervisorMode={ui.supervisorMode}
        onEditTask={ui.setEditingTask}
        onDeleteTask={ui.setDeletingTask}
        onAddTask={ui.setAddingTaskFor}
        onEditEmployee={ui.setEditingEmployee}
        onDeleteEmployee={ui.setDeletingEmployee}
      />

      <Dialogs board={board} ui={ui} />
    </main>
  );
}