import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
        onError={() => setImageError(true)}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
          sizeClasses[size],
          className
        )}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-800',
        sizeClasses[size],
        className
      )}
      aria-label="User avatar"
    >
      <User className={cn('text-secondary-400 dark:text-secondary-500', iconSizes[size])} />
    </div>
  );
}
