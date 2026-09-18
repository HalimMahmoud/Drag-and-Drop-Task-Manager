import type { TimelineRange } from '../../types';
import { Button } from '@/components/ui/button';
import { Redo2, Undo2, UserPlus } from 'lucide-react';
import TimelineRangeSelector from './TimelineRangeSelector';
import { SupervisorToggle } from './SupervisorToggle';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface HeaderProps {
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
}

export default function Header({
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
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__top">
        <div>
          <h1>Horizontal Task Board</h1>
          <p>Drag tasks to any hour slot · Resize with handles · Drag rows to reorder</p>
        </div>
        <div className="legend">
          <span>⟷ Drag to any hour</span>
          <span>↕ Move between rows</span>
          <span>⟺ Resize edges</span>
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
          <SupervisorToggle checked={supervisorMode} onChange={onSupervisorModeChange} />
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