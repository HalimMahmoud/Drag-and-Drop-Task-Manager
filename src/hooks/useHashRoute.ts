'use client';

import { useEffect, useState } from 'react';
import { currentBoardSlug } from '../utils/routing';

/**
 * The board slug from the address bar, kept in sync as the fragment changes.
 *
 * Returns null on first render so the caller can hold a neutral loading frame instead
 * of flashing the board list before the real route is known.
 */
export function useHashRoute(): { slug: string | null; ready: boolean } {
  const [slug, setSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSlug(currentBoardSlug());
      setReady(true);
    };

    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return { slug, ready };
}