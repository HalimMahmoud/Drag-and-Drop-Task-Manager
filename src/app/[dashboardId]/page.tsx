'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import App from '@/App';
import { getDashboard, type DashboardData } from '@/lib/supabase/dashboards';
import { EMPLOYEES, INITIAL_TASKS } from '@/utils/seed';
import { CreateDashboardModal } from '@/components/dashboard/CreateDashboardModal';
import { Button } from '@/components/ui/button';
import { LayoutGrid, ArrowLeft, Loader2 } from 'lucide-react';

export default function DashboardPage({
  params,
}: {
  params: Promise<{ dashboardId: string }>;
}) {
  const { dashboardId } = use(params);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [dashboardId]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading board /{dashboardId}...</span>
      </div>
    );
  }

  // If dashboard does not exist in DB
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="mx-auto max-w-md space-y-4 p-8 rounded-2xl border border-border bg-card shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LayoutGrid className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Board Not Found
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              The board <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">/{dashboardId}</code> doesn&apos;t exist yet or is private.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="gap-1.5">
                <ArrowLeft className="size-4" />
                All Boards
              </Link>
            </Button>
            <CreateDashboardModal initialId={dashboardId} />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard found! Automatically load and render board
  return (
    <App
      key={dashboardId}
      dashboardId={dashboardId}
      boardTitle={data.title || `Board: ${dashboardId}`}
      initialEmployees={data.employees?.length ? data.employees : EMPLOYEES}
      initialTasks={data.tasks?.length ? data.tasks : INITIAL_TASKS}
      initialTimelineRange={data.config || { startHour: 0, endHour: 12 }}
    />
  );
}
