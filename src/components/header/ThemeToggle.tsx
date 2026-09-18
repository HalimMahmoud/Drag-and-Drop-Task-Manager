'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="h-8 w-8 px-0"
    >
      {theme === 'light' ? (
        <Moon className="size-4 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="size-4 text-amber-400 transition-transform hover:rotate-45" />
      )}
    </Button>
  );
}
