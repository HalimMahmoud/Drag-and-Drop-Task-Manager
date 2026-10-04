'use client';

import { useEffect } from 'react';
import { useMemo } from 'react';
import BoardSection from './components/board/BoardSection';
import { Dialogs } from './components/dialogs/Dialogs';
import { AppHeader } from './components/layout/AppHeader';
import { useTaskBoard } from './hooks/board/useTaskBoard';
import { useAppUiState } from './hooks/board/useAppUiState';
import { useAuth } from './components/AuthProvider';
import { saveDashboardData } from './lib/supabase/dashboards';
import { formatBoardHeadline } from './utils/headlines';
import type { Employee, Task, TimelineConfig } from './types';

interface AppProps {
  dashboardId?: string;
  boardTitle?: string;
  initialEmployees?: Employee[];
  initialTasks?: Task[];
  initialTimelineConfig?: TimelineConfig;
  supervisorMode: boolean;
  onSupervisorModeChange: (value: boolean) => void;
  showBackButton?: boolean;
  /** Hash route for the back link. See `src/utils/routing.ts`. */
  backHref?: string;
  extraButton?: React.ReactNode;
}

export default function App({
  dashboardId,
  boardTitle = 'Horizontal Task Board',
  initialEmployees = [],
  initialTasks = [],
  initialTimelineConfig,
  supervisorMode,
  onSupervisorModeChange,
  showBackButton = false,
  backHref = '#/',
  extraButton,
}: AppProps) {
  const { user } = useAuth();
  const board = useTaskBoard(initialEmployees, initialTasks, initialTimelineConfig);
  const ui = useAppUiState();

  // Editing is an authenticated-only capability; signed-out visitors get a read-only board.
  const canManage = Boolean(user);
  const canEdit = canManage && supervisorMode;

  // Never leave the board editable after sign-out.
  useEffect(() => {
    if (!canManage && supervisorMode) {
      onSupervisorModeChange(false);
    }
  }, [canManage, supervisorMode, onSupervisorModeChange]);

  const headline = useMemo(
    () => formatBoardHeadline(board.employees, board.tasks, board.timelineConfig),
    [board.employees, board.tasks, board.timelineConfig]
  );

  // Auto-sync dashboard changes to Supabase DB when supervisor makes updates
  useEffect(() => {
    if (dashboardId && canEdit) {
      const timer = setTimeout(() => {
        saveDashboardData(dashboardId, board.employees, board.tasks, board.timelineConfig).catch(console.error);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dashboardId, canEdit, board.employees, board.tasks, board.timelineConfig]);

  return (
    <main className="app">
      <AppHeader
        title={boardTitle}
        subtitle={headline}
        supervisorMode={canEdit}
        onSupervisorModeChange={canManage ? onSupervisorModeChange : undefined}
        onAddEmployee={canManage ? () => ui.setAddingEmployee(true) : undefined}
        onUndo={canManage ? board.undo : undefined}
        onRedo={canManage ? board.redo : undefined}
        canUndo={board.canUndo}
        canRedo={board.canRedo}
        timelineConfig={board.timelineConfig}
        onTimelineConfigChange={canManage ? board.setTimelineConfig : undefined}
        hiddenTaskCount={board.hiddenTaskCount}
        showBackButton={showBackButton}
        backHref={backHref}
        extraButton={canManage ? extraButton : undefined}
      />

      <BoardSection
        board={board}
        supervisorMode={canEdit}
        onEditTask={ui.setEditingTask}
        onDeleteTask={ui.setDeletingTask}
        onAddTask={ui.setAddingTaskFor}
        onEditEmployee={ui.setEditingEmployee}
        onDeleteEmployee={ui.setDeletingEmployee}
      />

      <Dialogs board={board} ui={ui} supervisorMode={canEdit} />
    </main>
  );
}