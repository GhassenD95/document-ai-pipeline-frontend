import type { DocumentStatus } from '@/types/document';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md';
}

const config: Record<DocumentStatus, { bg: string; text: string; icon: string; spin?: boolean; fill?: boolean }> = {
  PENDING: { bg: 'bg-warning/10', text: 'text-warning', icon: 'pending' },
  PROCESSING: { bg: 'bg-primary/10', text: 'text-primary', icon: 'sync', spin: true },
  COMPLETED: { bg: 'bg-success/10', text: 'text-success', icon: 'check_circle', fill: true },
  FAILED: { bg: 'bg-error-container', text: 'text-error', icon: 'cancel' },
};

export function Badge({ status, size = 'sm' }: BadgeProps) {
  const c = config[status];
  const px = size === 'sm' ? 'px-2.5 py-0.5' : 'px-3 py-1';
  const iconSize = size === 'sm' ? 'text-[16px]' : 'text-[18px]';

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-label-sm text-label-sm', px, c.bg, c.text)}>
      <span className={cn('material-symbols-outlined', iconSize, c.spin && 'animate-spin')}
        style={c.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}>
        {c.icon}
      </span>
      {status}
    </span>
  );
}
