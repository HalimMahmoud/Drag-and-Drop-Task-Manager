import { useEffect } from 'react';
import Header from './components/header/Header';
import BoardSection from './components/board/BoardSection';
import { Dialogs } from './components/dialogs/Dialogs';
import { useTaskBoard } from './hooks/board/useTaskBoard';
import { useAppUiState } from './hooks/board/useAppUiState';
import { useAuth } from './components/AuthProvider';
import { saveDashboardData } from './lib/supabase/dashboards';
import type { Employee, Task, TimelineRange } from './types';

interface AppProps {
  dashboardId?: string;
  boardTitle?: string;
  initialEmployees?: Employee[];
  initialTasks?: Task[];
  initialTimelineRange?: TimelineRange;
}

export default function App({
  dashboardId,
  boardTitle = 'Horizontal Task Board',
  initialEmployees = [],
  initialTasks = [],
  initialTimelineRange,
}: AppProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const board = useTaskBoard(initialEmployees, initialTasks, initialTimelineRange);
  const ui = useAppUiState();

  // Force supervisor mode off when not authenticated
  const effectiveSupervisorMode = isAuthenticated && ui.supervisorMode;

  // Auto-sync dashboard changes to Supabase DB when supervisor makes updates
  useEffect(() => {
    if (dashboardId && effectiveSupervisorMode) {
      const timer = setTimeout(() => {
        saveDashboardData(dashboardId, board.employees, board.tasks, board.timelineRange).catch(console.error);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dashboardId, effectiveSupervisorMode, board.employees, board.tasks, board.timelineRange]);

  return (
    <main className="app">
      <Header
        dashboardId={dashboardId}
        boardTitle={boardTitle}
        isAuthenticated={isAuthenticated}
        supervisorMode={effectiveSupervisorMode}
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
        supervisorMode={effectiveSupervisorMode}
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