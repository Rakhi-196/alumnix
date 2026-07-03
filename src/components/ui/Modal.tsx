import { Fragment, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn(
                'relative w-full rounded-xl bg-white p-6 shadow-xl dark:bg-secondary-900',
                sizes[size]
              )}
            >
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-4 h-8 w-8 p-0"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {title && (
                <h2 className="pr-8 text-xl font-semibold text-secondary-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                  {description}
                </p>
              )}
              <div className="mt-4">{children}</div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
