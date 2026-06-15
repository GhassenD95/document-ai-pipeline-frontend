import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90 shadow-sm',
  secondary: 'bg-primary-container text-on-primary-container hover:opacity-90 shadow-sm',
  outline: 'border border-border text-on-surface-variant hover:bg-surface-container-low',
  ghost: 'text-on-surface-variant hover:bg-surface-container-low',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-label-sm rounded-lg',
  md: 'h-10 px-5 text-label-md rounded-lg',
  lg: 'h-11 px-6 text-label-md rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-95 duration-150 ease-in-out cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed active:scale-100',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}
