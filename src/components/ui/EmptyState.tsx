import { cn } from '@/utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {icon && (
        <div className="mb-4 text-secondary-400 dark:text-secondary-500">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-secondary-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-secondary-600 dark:text-secondary-400">
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}
