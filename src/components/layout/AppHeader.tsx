'use client';

import Link from 'next/link';
import { ArrowLeft, Layers, UserPlus, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/header/ThemeToggle';
import { UserMenu } from '@/components/header/UserMenu';
import { CreateDashboardModal } from '@/components/dashboard/CreateDashboardModal';
import { SupervisorToggle } from '@/components/header/SupervisorToggle';
import TimelineRangeSelector from '@/components/header/TimelineRangeSelector';
import type { TimelineConfig } from '../../types';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showCreateButton?: boolean;
  showBackButton?: boolean;
  /** Hash route for the back link, e.g. `#/`. See `src/utils/routing.ts`. */
  backHref?: string;
  backLabel?: string;
  supervisorMode?: boolean;
  onSupervisorModeChange?: (value: boolean) => void;
  onAddEmployee?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  timelineConfig?: TimelineConfig;
  onTimelineConfigChange?: (config: TimelineConfig) => void;
  hiddenTaskCount?: number;
  extraButton?: React.ReactNode;
  rightExtra?: React.ReactNode;
}

export function AppHeader({
  title = 'Team Task Board',
  subtitle,
  showCreateButton = true,
  showBackButton = false,
  backHref = '#/',
  backLabel = 'All Boards',
  supervisorMode = false,
  onSupervisorModeChange,
  onAddEmployee,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  timelineConfig,
  onTimelineConfigChange,
  hiddenTaskCount = 0,
  extraButton,
  rightExtra,
}: AppHeaderProps) {
  return (
    <header className="header">
      <div className="header__top w-full px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBackButton && (
            // A plain anchor, not <Link>: back targets are fragment routes, and a
            // fragment-only href must change the hash without touching the path.
            <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
              <a href={backHref}>
                <ArrowLeft className="size-4" />
                {backLabel}
              </a>
            </Button>
          )}
          <div className="size-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Layers className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="m-0 truncate font-semibold text-sm tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="m-0 truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="legend flex items-center gap-2">
          {supervisorMode && (
            <p className="m-0 hidden text-xs text-muted-foreground md:block">
              Drag tasks to any hour · move them between rows · resize either edge
            </p>
          )}
          {supervisorMode && onUndo && onRedo && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
                className="h-8 w-8 px-0"
              >
                <Undo2 className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
                className="h-8 w-8 px-0"
              >
                <Redo2 className="size-4" />
              </Button>
            </div>
          )}
          {supervisorMode && onAddEmployee && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAddEmployee}
              className="gap-1.5"
            >
              <UserPlus className="size-4" />
              Add Employee
            </Button>
          )}
          {showCreateButton && <CreateDashboardModal />}
          {extraButton}
          {rightExtra}
          {onSupervisorModeChange && (
            <SupervisorToggle
              checked={supervisorMode}
              onChange={onSupervisorModeChange}
            />
          )}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {supervisorMode && timelineConfig && onTimelineConfigChange && (
        <TimelineRangeSelector
          timelineConfig={timelineConfig}
          onTimelineConfigChange={onTimelineConfigChange}
          hiddenTaskCount={hiddenTaskCount}
        />
      )}
    </header>
  );
}