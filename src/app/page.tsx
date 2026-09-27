'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllDashboards, type DashboardSummary } from '@/lib/supabase/dashboards';
import { CreateDashboardModal } from '@/components/dashboard/CreateDashboardModal';
import { ThemeToggle } from '@/components/header/ThemeToggle';
import { UserMenu } from '@/components/header/UserMenu';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  Search,
  Users,
  CheckSquare,
  ArrowRight,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function HomePage() {
  const [dashboards, setDashboards] = useState<DashboardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers className="size-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-foreground">
                Task Timeline
              </span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                PDD Board
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreateDashboardModal />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Hero & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <LayoutGrid className="size-6 text-primary" />
              All Boards
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select a task board to collaborate, view the horizontal timeline, or manage schedules.
            </p>
          </div>

          {/* Search bar & Refresh */}
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
        </div>

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
      </main>
    </div>
  );
}