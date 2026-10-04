'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createDashboard } from '@/lib/supabase/dashboards';
import { slugify } from '@/utils/slugify';
import { TIME_UNITS, TIME_UNIT_DEFINITIONS, getDefaultTimelineConfig } from '@/utils/timeUnits';
import { navigateToBoard } from '@/utils/routing';
import type { TimeUnit } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CreateDashboardModalProps {
  trigger?: React.ReactNode;
}

export function CreateDashboardModal({ trigger }: CreateDashboardModalProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState<TimeUnit>('hours');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a board title.');
      return;
    }

    setLoading(true);
    const res = await createDashboard(title.trim(), user?.id || '', getDefaultTimelineConfig(unit));

    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to create board.');
      return;
    }

    setOpen(false);
    setTitle('');
    setUnit('hours');

    // Hash route, not a path: a static export has no file at /<slug>. The id is only
    // absent if creation reported success without one, which the write path prevents.
    if (res.dashboardId) {
      navigateToBoard(res.dashboardId);
    }
  };

  if (!user) {
    if (trigger) {
      return (
        <div onClick={() => router.push('/login')} className="inline-block cursor-pointer">
          {trigger}
        </div>
      );
    }
    return (
      <Button size="sm" variant="default" className="gap-1.5" onClick={() => router.push('/login')}>
        <Plus className="size-4" />
        New Board
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button size="sm" variant="default" className="gap-1.5">
            <Plus className="size-4" />
            New Board
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="size-5 text-primary" />
            Create New Task Board
          </DialogTitle>
          <DialogDescription>
            A new board will be created with a dummy employee and task. You can edit or delete them after.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Board Title
            </label>
            <input
              type="text"
              placeholder="e.g. Sprint 24 Board"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
              autoFocus
            />
            {title.trim() && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Board URL: <code>/{slugify(title.trim())}</code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Time plan
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_UNITS.map((option) => {
                const definition = TIME_UNIT_DEFINITIONS[option];
                const isActive = option === unit;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setUnit(option)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {definition.label}
                    <span className="ml-1 opacity-70">
                      1&ndash;{definition.maxSlots}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Schedule work in {TIME_UNIT_DEFINITIONS[unit].plural}, up to{' '}
              {TIME_UNIT_DEFINITIONS[unit].maxSlots} on the timeline.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}