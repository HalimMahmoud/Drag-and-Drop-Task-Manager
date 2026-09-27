'use client';

import { useEffect } from 'react';
import BoardSection from './components/board/BoardSection';
import { Dialogs } from './components/dialogs/Dialogs';
import { AppHeader } from './components/layout/AppHeader';
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
  supervisorMode: boolean;
  onSupervisorModeChange: (value: boolean) => void;
  showBackButton?: boolean;
  backHref?: string;
  extraButton?: React.ReactNode;
}

export default function App({
  dashboardId,
  boardTitle = 'Horizontal Task Board',
  initialEmployees = [],
  initialTasks = [],
  initialTimelineRange,
  supervisorMode,
  onSupervisorModeChange,
  showBackButton = false,
  backHref = '/',
  extraButton,
}: AppProps) {
  const { user } = useAuth();
  const board = useTaskBoard(initialEmployees, initialTasks, initialTimelineRange);
  const ui = useAppUiState();

  // Auto-sync dashboard changes to Supabase DB when supervisor makes updates
  useEffect(() => {
    if (dashboardId && supervisorMode) {
      const timer = setTimeout(() => {
        saveDashboardData(dashboardId, board.employees, board.tasks, board.timelineRange).catch(console.error);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dashboardId, supervisorMode, board.employees, board.tasks, board.timelineRange]);

  return (
    <main className="app">
      <AppHeader
        title={boardTitle}
        supervisorMode={supervisorMode}
        onSupervisorModeChange={onSupervisorModeChange}
        onAddEmployee={() => ui.setAddingEmployee(true)}
        onUndo={board.undo}
        onRedo={board.redo}
        canUndo={board.canUndo}
        canRedo={board.canRedo}
        timelineRange={board.timelineRange}
        onTimelineRangeChange={board.setTimelineRange}
        hiddenTaskCount={board.hiddenTaskCount}
        showBackButton={showBackButton}
        backHref={backHref}
        extraButton={extraButton}
      />

      <BoardSection
        board={board}
        supervisorMode={supervisorMode}
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