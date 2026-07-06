import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
}

function ScrollArea({ className, orientation = 'vertical', children, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'overflow-auto',
        {
          'overflow-y-auto overflow-x-hidden': orientation === 'vertical',
          'overflow-x-auto overflow-y-hidden': orientation === 'horizontal',
          'overflow-auto': orientation === 'both',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { ScrollArea };
