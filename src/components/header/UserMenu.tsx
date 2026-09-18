'use client';

import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function UserMenu() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="h-8 w-8 rounded-md"
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}