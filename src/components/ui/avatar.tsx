import type React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="avatar"
      className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn('flex size-full items-center justify-center rounded-full bg-muted', className)}
      {...props}
    />
  );
}
