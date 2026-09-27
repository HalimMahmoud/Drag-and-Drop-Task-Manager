'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createDashboard } from '@/lib/supabase/dashboards';
import { slugify } from '@/utils/slugify';
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
    const res = await createDashboard(
      title.trim(),
      user?.id || ''
    );

    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to create board.');
      return;
    }

    setOpen(false);
    setTitle('');
    router.push(`/${res.dashboardId}`);
    router.refresh();
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