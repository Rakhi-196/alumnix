import { createContext, useContext, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn('', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex gap-1 rounded-lg bg-secondary-100 p-1 dark:bg-secondary-800',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative rounded-md px-4 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'text-secondary-900 dark:text-white'
          : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-secondary-700"
          transition={{ type: 'spring', duration: 0.3 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-4', className)}
    >
      {children}
    </motion.div>
  );
}
