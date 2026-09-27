'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { slugify } from '@/utils/slugify';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';

interface EditDashboardDialogProps {
  dashboardId: string;
  currentTitle: string;
  onSaved: (newId: string, newTitle: string) => void;
  trigger?: React.ReactNode;
}

export function EditDashboardDialog({ dashboardId, currentTitle, onSaved, trigger }: EditDashboardDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [newId, setNewId] = useState(dashboardId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (newId === dashboardId) {
      setNewId(slugify(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!newId.trim()) {
      setError('URL slug is required.');
      return;
    }

    setLoading(true);
    try {
      const { updateDashboard } = await import('@/lib/supabase/dashboards');
      const res = await updateDashboard(dashboardId, {
        title: title.trim(),
        newId: newId.trim(),
      });
      if (!res.success) {
        setError(res.error || 'Failed to update board.');
        return;
      }
      setOpen(false);
      onSaved(newId.trim(), title.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
          <DialogDescription>Update the board title and URL slug.</DialogDescription>
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
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Sprint 24 Board"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              URL Slug
            </label>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-2 border border-r-0 rounded-l-md">
                /
              </span>
              <Input
                value={newId}
                onChange={(e) => setNewId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="rounded-l-none font-mono"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Your board will be at: <code>/{newId || 'your-slug'}</code>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}