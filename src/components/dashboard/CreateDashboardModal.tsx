'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createDashboard } from '@/lib/supabase/dashboards';
import { EMPLOYEES as initialEmployees, INITIAL_TASKS as initialTasks } from '@/utils/seed';
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
  initialId?: string;
  trigger?: React.ReactNode;
}

export function CreateDashboardModal({ initialId = '', trigger }: CreateDashboardModalProps = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dashboardId, setDashboardId] = useState(initialId);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = dashboardId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (!cleanId) {
      setError('Please enter a valid Dashboard ID.');
      return;
    }

    setLoading(true);
    const res = await createDashboard(
      cleanId,
      title.trim() || 'Horizontal Task Board',
      user?.id || '',
      initialEmployees,
      initialTasks
    );

    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to create dashboard. ID may already be taken.');
      return;
    }

    setOpen(false);
    setDashboardId('');
    setTitle('');
    router.push(`/${cleanId}`);
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
            Enter a unique Board ID (URL path) and title for your dashboard.
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
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Custom Board ID (URL Path)
            </label>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-2 border border-r-0 rounded-l-md">
                /
              </span>
              <input
                type="text"
                placeholder="sprint-24"
                value={dashboardId}
                onChange={(e) => setDashboardId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full px-3 py-2 text-sm border rounded-r-md bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Your board will be accessible at: <code>/{dashboardId || 'your-board-id'}</code>
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
