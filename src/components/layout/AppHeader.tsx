'use client';

import Link from 'next/link';
import { Layers, LayoutGrid, Plus, UserPlus, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/header/ThemeToggle';
import { UserMenu } from '@/components/header/UserMenu';
import { CreateDashboardModal } from '@/components/dashboard/CreateDashboardModal';
import { SupervisorToggle } from '@/components/header/SupervisorToggle';
import TimelineRangeSelector from '@/components/header/TimelineRangeSelector';
import type { TimelineRange } from '../../types';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showCreateButton?: boolean;
  showBackButton?: boolean;
  backHref?: string;
  supervisorMode?: boolean;
  onSupervisorModeChange?: (value: boolean) => void;
  onAddEmployee?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  timelineRange?: TimelineRange;
  onTimelineRangeChange?: (range: TimelineRange) => void;
  hiddenTaskCount?: number;
  extraButton?: React.ReactNode;
  rightExtra?: React.ReactNode;
}

export function AppHeader({
  title = 'Task Timeline',
  subtitle = 'PDD Board',
  showCreateButton = true,
  showBackButton = false,
  backHref = '/',
  supervisorMode = false,
  onSupervisorModeChange,
  onAddEmployee,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  timelineRange,
  onTimelineRangeChange,
  hiddenTaskCount = 0,
  extraButton,
  rightExtra,
}: AppHeaderProps) {
  return (
    <header className="header">
      <div className="header__top w-full px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Layers className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-foreground">
              {title}
            </span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="legend flex items-center gap-2">
          {supervisorMode && (
            <>
              <span>⟷ Drag to any hour</span>
              <span>↕ Move between rows</span>
              <span>⟺ Resize edges</span>
            </>
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
          {showBackButton && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={backHref}>
                <LayoutGrid className="size-4" />
              </Link>
            </Button>
          )}
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

      {supervisorMode && timelineRange && onTimelineRangeChange && (
        <TimelineRangeSelector
          timelineRange={timelineRange}
          onTimelineRangeChange={onTimelineRangeChange}
          hiddenTaskCount={hiddenTaskCount}
        />
      )}
    </header>
  );
}