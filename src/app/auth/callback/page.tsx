'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { boardListHref, goToTarget, safeRedirectTarget } from '@/utils/routing';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Completes the PKCE sign-in handshake in the browser.
 *
 * This used to be a server Route Handler, but GitHub Pages has no runtime, and
 * `exchangeCodeForSession` is a public API operation the browser can perform itself.
 * The one-time `code` is spent on arrival and never appears again.
 */
export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    // Validated here, not trusted: only a board-list or single-board hash survives.
    const destination = safeRedirectTarget(params.get('next'));

    if (!code) {
      goToTarget(destination);
      return;
    }

    createClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        goToTarget(destination);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not complete sign-in.');
      });
  }, []);

  if (error) {
    return (
      <main className="app flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="m-0 text-lg font-bold text-foreground">Sign-in failed</h1>
        <p className="m-0 max-w-sm text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <a href={boardListHref()}>Back to boards</a>
        </Button>
      </main>
    );
  }

  return (
    <main className="app flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="m-0 text-sm font-medium">Finishing sign-in&hellip;</p>
    </main>
  );
}