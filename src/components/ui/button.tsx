import * as React from 'react';
import { cn } from '@/lib/utils';

function Slot({ children, ...rest }: React.ComponentPropsWithoutRef<'button'>) {
  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
  return React.cloneElement(child, {
    ...rest,
    className: cn(rest.className, child.props['className'] as string | undefined),
  });
}

const buttonVariants = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost:
    'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentPropsWithoutRef<'button'> & {
  variant?: keyof typeof buttonVariants;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}) {
  if (asChild) {
    return <Slot {...props} className={cn(
      'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium',
      'transition-colors focus-visible:outline-none disabled:pointer-events-none',
      'disabled:opacity-50',
      buttonVariants[variant],
      size === 'icon' ? 'h-9 w-9' : size === 'sm' ? 'h-8 rounded-md px-3' : size === 'lg' ? 'h-10 rounded-md px-6' : 'h-9 px-4 py-2',
      className
    )} />;
  }

  const sizeClass = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3',
    lg: 'h-10 rounded-md px-6',
    icon: 'h-9 w-9',
  }[size];

  return (
    <button
      data-slot="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium',
        'transition-colors focus-visible:outline-none disabled:pointer-events-none',
        'disabled:opacity-50',
        buttonVariants[variant],
        sizeClass,
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
