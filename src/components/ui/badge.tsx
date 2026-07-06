import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        {
          'bg-primary/20 text-primary border border-primary/30': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'default',
          'bg-muted text-muted-foreground': variant === 'secondary',
          'bg-destructive/20 text-destructive border border-destructive/30': variant === 'destructive',
          'border border-border text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
