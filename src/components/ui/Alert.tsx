import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  info: {
    container: 'bg-primary-50 border-primary-200 dark:bg-primary-950/50 dark:border-primary-800',
    icon: 'text-primary-600 dark:text-primary-400',
    title: 'text-primary-900 dark:text-primary-100',
    content: 'text-primary-700 dark:text-primary-300',
  },
  success: {
    container: 'bg-success-50 border-success-200 dark:bg-success-950/50 dark:border-success-800',
    icon: 'text-success-600 dark:text-success-400',
    title: 'text-success-900 dark:text-success-100',
    content: 'text-success-700 dark:text-success-300',
  },
  warning: {
    container: 'bg-warning-50 border-warning-200 dark:bg-warning-950/50 dark:border-warning-800',
    icon: 'text-warning-600 dark:text-warning-400',
    title: 'text-warning-900 dark:text-warning-100',
    content: 'text-warning-700 dark:text-warning-300',
  },
  error: {
    container: 'bg-error-50 border-error-200 dark:bg-error-950/50 dark:border-error-800',
    icon: 'text-error-600 dark:text-error-400',
    title: 'text-error-900 dark:text-error-100',
    content: 'text-error-700 dark:text-error-300',
  },
};

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const Icon = icons[variant];
  const styles = variants[variant];

  return (
    <div className={cn('rounded-lg border p-4', styles.container, className)}>
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn('font-medium', styles.title)}>{title}</h4>
          )}
          <div className={cn('text-sm', title && 'mt-1', styles.content)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
