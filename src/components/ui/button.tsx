import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ),
  {
    variants: {
      variant: {
        default: cn('bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80'),
        destructive: cn('bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80'),
        outline: cn(
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:text-accent-foreground',
        ),
        secondary: cn('bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60'),
        ghost: cn('hover:bg-accent hover:text-accent-foreground active:bg-accent/80'),
        link: cn('text-primary underline-offset-4 hover:underline'),
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as { className?: string };
      return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>, {
        ref,
        className: cn(
          buttonVariants({ variant, size }),
          className,
          childProps.className,
        ),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
