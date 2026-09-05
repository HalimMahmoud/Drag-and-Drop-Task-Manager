import type React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        high: 'border-transparent bg-red-100 text-red-700 hover:bg-red-100',
        medium: 'border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100',
        low: 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100',
      },
    },
    defaultVariants: { variant: 'medium' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
