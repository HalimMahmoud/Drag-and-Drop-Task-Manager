'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import App from '@/App';
import { getDashboard, type DashboardData } from '@/lib/supabase/dashboards';
import { EditDashboardDialog } from '@/components/dashboard/EditDashboardDialog';
import { navigateToBoard, boardListHref } from '@/utils/routing';
import { Button } from '@/components/ui/button';
import { LayoutGrid, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Renders one board by slug, fetching it from Supabase in the browser.
 *
 * Rendering is driven by the hash fragment (see `src/utils/routing.ts`) rather than a
 * path, so a statically exported site can address any board without a server.
 */
export default function BoardView({ dashboardId }: { dashboardId: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [supervisorMode, setSupervisorMode] = useState(false);
  // Bumping this remounts <App>, which is how a re-fetched plan (and the tasks the
  // server re-anchored onto the new grid) replace the in-memory board.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getDashboard(dashboardId)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dashboardId, reloadKey]);

  if (loading) {
    return (
      <main className="app flex h-screen w-screen flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="m-0 text-sm font-medium">Loading schedule for /{dashboardId}&hellip;</p>
      </main>
    );
  }

  // If dashboard does not exist in DB
  if (!data) {
    return (
      <main className="app flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mx-auto max-w-md space-y-4 p-8 rounded-2xl border border-border bg-card shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LayoutGrid className="size-6" />
          </div>
          <div>
            <h1 className="m-0 text-xl font-bold tracking-tight text-foreground">
              This board isn&apos;t available
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              No schedule exists at <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">/{dashboardId}</code>. It may have been deleted, renamed, or set to private.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-3">
            <Button asChild variant="outline" size="sm">
              <a href={boardListHref()} className="gap-1.5">
                <ArrowLeft className="size-4" />
                All Boards
              </a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard found! Automatically load and render board
  return (
    <App
      key={`${dashboardId}:${reloadKey}`}
      dashboardId={dashboardId}
      boardTitle={data.title || `Board: ${dashboardId}`}
      initialEmployees={data.employees ?? []}
      initialTasks={data.tasks ?? []}
      initialTimelineConfig={data.config}
      supervisorMode={supervisorMode}
      onSupervisorModeChange={setSupervisorMode}
      showBackButton={true}
      backHref={boardListHref()}
      extraButton={
        <EditDashboardDialog
          dashboardId={dashboardId}
          currentTitle={data.title || ''}
          currentUnit={data.config?.unit}
          onSaved={(newId, newTitle, unitChanged) => {
            if (unitChanged) {
              // Re-anchor server-side, then pull the new plan and task set back in.
              setReloadKey((key) => key + 1);
              return;
            }
            if (newId !== dashboardId) {
              navigateToBoard(newId);
            } else {
              setData((prev) => prev ? { ...prev, title: newTitle } : prev);
            }
          }}
        />
      }
    />
  );
}