'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import App from '@/App';
import { getDashboard, type DashboardData } from '@/lib/supabase/dashboards';
import { EMPLOYEES, INITIAL_TASKS } from '@/utils/seed';
import { EditDashboardDialog } from '@/components/dashboard/EditDashboardDialog';
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
  const [supervisorMode, setSupervisorMode] = useState(false);
  const router = useRouter();

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
      <main className="app flex h-screen w-screen flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading board /{dashboardId}...</span>
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
          </div>
        </div>
      </main>
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
      supervisorMode={supervisorMode}
      onSupervisorModeChange={setSupervisorMode}
      showBackButton={true}
      backHref="/"
      extraButton={
        <EditDashboardDialog
          dashboardId={dashboardId}
          currentTitle={data.title || ''}
          onSaved={(newId, newTitle) => {
            if (newId !== dashboardId) {
              router.push(`/${newId}`);
            } else {
              setData((prev) => prev ? { ...prev, title: newTitle } : prev);
            }
          }}
        />
      }
    />
  );
}
