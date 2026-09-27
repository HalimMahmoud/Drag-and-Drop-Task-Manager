import type { TimelineRange } from '../../types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Redo2, Undo2, UserPlus, ArrowLeft } from 'lucide-react';
import TimelineRangeSelector from './TimelineRangeSelector';
import { SupervisorToggle } from './SupervisorToggle';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { CreateDashboardModal } from '@/components/dashboard/CreateDashboardModal';

interface HeaderProps {
  isAuthenticated: boolean;
  supervisorMode: boolean;
  onSupervisorModeChange: (value: boolean) => void;
  onAddEmployee: () => void;
  timelineRange: TimelineRange;
  onTimelineRangeChange: (range: TimelineRange) => void;
  hiddenTaskCount: number;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  boardTitle?: string;
  dashboardId?: string;
}

export default function Header({
  isAuthenticated,
  supervisorMode,
  onSupervisorModeChange,
  onAddEmployee,
  timelineRange,
  onTimelineRangeChange,
  hiddenTaskCount,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  boardTitle = 'Horizontal Task Board',
  dashboardId,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__top">
        <div>
          <div className="flex items-center gap-2">
            {dashboardId && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0"
              >
                <Link href="/" title="Back to All Boards">
                  <ArrowLeft className="size-3.5" />
                  <span className="hidden sm:inline">All Boards</span>
                </Link>
              </Button>
            )}
            <h1>{boardTitle}</h1>
          </div>
          {supervisorMode ? (
            <p>Drag tasks to any hour slot · Resize with handles · Drag rows to reorder</p>
          ) : (
            <p>View-only preview mode</p>
          )}
        </div>
        <div className="legend">
          {supervisorMode && (
            <>
              <span>⟷ Drag to any hour</span>
              <span>↕ Move between rows</span>
              <span>⟺ Resize edges</span>
            </>
          )}
          {supervisorMode && (
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
          {supervisorMode && (
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
          {isAuthenticated && <CreateDashboardModal />}
          {isAuthenticated && (
            <SupervisorToggle checked={supervisorMode} onChange={onSupervisorModeChange} />
          )}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {supervisorMode && (
        <TimelineRangeSelector
          timelineRange={timelineRange}
          onTimelineRangeChange={onTimelineRangeChange}
          hiddenTaskCount={hiddenTaskCount}
        />
      )}
    </header>
  );
}