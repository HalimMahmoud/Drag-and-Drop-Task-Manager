import type React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ),
  {
    variants: {
      variant: {
        high: cn('border-transparent bg-destructive/10 text-destructive'),
        medium: cn('border-transparent bg-amber-100 text-amber-700'),
        low: cn('border-transparent bg-blue-100 text-blue-700'),
      },
    },
    defaultVariants: { variant: 'medium' },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
