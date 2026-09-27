'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllDashboards, type DashboardSummary } from '@/lib/supabase/dashboards';
import { EditDashboardDialog } from '@/components/dashboard/EditDashboardDialog';
import { CreateDashboardModal } from '@/components/dashboard/CreateDashboardModal';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import {
  Search,
  Users,
  CheckSquare,
  ArrowRight,
  Copy,
  Check,
  Trash2,
  Pencil,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function HomePage() {
  const [dashboards, setDashboards] = useState<DashboardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const data = await getAllDashboards();
      setDashboards(data);
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboards();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const { deleteDashboard } = await import('@/lib/supabase/dashboards');
      const ok = await deleteDashboard(id);
      if (ok) {
        setDashboards((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete board:', err);
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = dashboards.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
  });

  return (
    <main className="app flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader
        title="All Boards"
        subtitle="Task timelines"
        showCreateButton={true}
        rightExtra={
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-card border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboards}
              disabled={loading}
              title="Refresh boards"
              className="h-8 w-8 px-0 shrink-0"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-6">

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-border bg-card/40 animate-pulse space-y-3"
              >
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-8 bg-muted rounded w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Boards Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filtered.map((board) => (
              <div
                key={board.id}
                className="group relative flex flex-col justify-between p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                        {board.title}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          /{board.id}
                        </span>
                        {board.is_public && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Public
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <EditDashboardDialog
                        dashboardId={board.id}
                        currentTitle={board.title}
                        onSaved={(newId, newTitle) => {
                          setDashboards((prev) =>
                            prev.map((d) =>
                              d.id === board.id
                                ? { ...d, id: newId, title: newTitle }
                                : d
                            )
                          );
                        }}
                        trigger={
                          <button
                            title="Edit board"
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        }
                      />
                      <button
                        onClick={(e) => handleCopyLink(board.id, e)}
                        title="Copy board URL"
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                      >
                        {copiedId === board.id ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(board.id);
                        }}
                        title="Delete board"
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-primary/70" />
                      {board.employee_count} {board.employee_count === 1 ? 'member' : 'members'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="size-3.5 text-primary/70" />
                      {board.task_count} {board.task_count === 1 ? 'task' : 'tasks'}
                    </span>
                    {board.created_at && (
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 ml-auto">
                        <Calendar className="size-3" />
                        {new Date(board.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Open Board Action */}
                <div className="pt-4 mt-3 border-t border-border/50">
                  <Button asChild size="sm" className="w-full justify-between group/btn">
                    <Link href={`/${board.id}`}>
                      <span>Open Board</span>
                      <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Search Filter State */}
        {!loading && dashboards.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Search className="size-8 mx-auto text-muted-foreground/60" />
            <h3 className="font-semibold text-foreground">No boards found</h3>
            <p className="text-xs text-muted-foreground">
              No boards match your search query &quot;{searchQuery}&quot;.
            </p>
            <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>
              Clear Filter
            </Button>
          </div>
        )}

        {/* No Boards State */}
        {!loading && dashboards.length === 0 && (
          <div className="p-8 rounded-2xl border border-dashed border-border bg-card/50 text-center max-w-md mx-auto space-y-4 my-8">
            <div className="size-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">No boards yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first team task board to organize tasks across horizontal timelines.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <CreateDashboardModal />
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="font-semibold text-foreground mb-2">Delete Board</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this board? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingId(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(deletingId)}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}