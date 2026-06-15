import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className, noPadding }: CardProps) {
  return (
    <div className={cn(
      'bg-surface border border-border rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]',
      !noPadding && 'p-6',
      className,
    )}>
      {children}
    </div>
  );
}
