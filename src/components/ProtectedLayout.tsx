'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { currentHref } from '@/utils/routing';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Carry the current hash route, not the pathname: the board being viewed lives
      // in the fragment, which usePathname would drop.
      router.push(`/login?redirect=${encodeURIComponent(currentHref())}`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
}