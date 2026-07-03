import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variants = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'primary', size = 'md', className }: BadgeProps) {
  return (
    <span className={cn(variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
