import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Button, Input } from '@/components/ui';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-secondary-200 bg-white/80 backdrop-blur-lg dark:border-secondary-800 dark:bg-secondary-900/80">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full mt-2 w-72 rounded-lg bg-white p-2 shadow-lg dark:bg-secondary-800 lg:hidden"
                >
                  <Input placeholder="Search..." leftIcon={<Search className="h-4 w-4" />} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:block">
            <Input
              placeholder="Search alumni, events, jobs..."
              leftIcon={<Search className="h-4 w-4" />}
              className="w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Link to="/notifications">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error-500" />
            </Button>
          </Link>

          <div ref={userMenuRef} className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
              <span className="hidden font-medium md:inline-block">
                {profile?.full_name?.split(' ')[0]}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-secondary-200 bg-white py-2 shadow-lg dark:border-secondary-700 dark:bg-secondary-800"
                >
                  <div className="border-b border-secondary-200 px-4 py-2 dark:border-secondary-700">
                    <p className="font-medium text-secondary-900 dark:text-white">
                      {profile?.full_name}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {profile?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700/50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700/50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-secondary-200 py-1 dark:border-secondary-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
