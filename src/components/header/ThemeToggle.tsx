'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="size-8"
    >
      {theme === 'light' ? (
        <Moon className="size-4 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="size-4 text-primary transition-transform hover:rotate-45" />
      )}
    </Button>
  );
}
