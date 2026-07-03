import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Briefcase,
  Newspaper,
  UsersRound,
  MessageSquare,
  Bell,
  User,
  Settings,
  GraduationCap,
  UserCog,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: ('admin' | 'alumni' | 'student')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: '/dashboard' },
  { label: 'Alumni Directory', icon: <Users className="h-5 w-5" />, href: '/alumni' },
  { label: 'Events', icon: <CalendarDays className="h-5 w-5" />, href: '/events' },
  { label: 'Jobs', icon: <Briefcase className="h-5 w-5" />, href: '/jobs' },
  { label: 'News Feed', icon: <Newspaper className="h-5 w-5" />, href: '/news' },
  { label: 'Mentorship', icon: <UsersRound className="h-5 w-5" />, href: '/mentorship' },
  { label: 'Messages', icon: <MessageSquare className="h-5 w-5" />, href: '/chat' },
  { label: 'Profile', icon: <User className="h-5 w-5" />, href: '/profile' },
];

const adminNavItems: NavItem[] = [
  { label: 'Admin Panel', icon: <Settings className="h-5 w-5" />, href: '/admin' },
  { label: 'Manage Users', icon: <UserCog className="h-5 w-5" />, href: '/admin/users' },
  { label: 'Manage Events', icon: <CalendarDays className="h-5 w-5" />, href: '/admin/events' },
  { label: 'Manage Jobs', icon: <Briefcase className="h-5 w-5" />, href: '/admin/jobs' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(profile?.role || 'student')
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-secondary-200 bg-white transition-transform duration-300 dark:border-secondary-800 dark:bg-secondary-900 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-secondary-200 px-6 dark:border-secondary-800">
          <GraduationCap className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-secondary-900 dark:text-white">AlumniHub</span>
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col">
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-secondary-50 p-3 dark:bg-secondary-800/50">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-secondary-900 dark:text-white">
                  {profile?.full_name}
                </p>
                <p className="truncate text-xs text-secondary-600 dark:text-secondary-400">
                  {profile?.role === 'admin' && 'Administrator'}
                  {profile?.role === 'alumni' && profile?.current_company}
                  {profile?.role === 'student' && profile?.department}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-white'
                    )
                  }
                >
                  {item.icon}
                  {item.label}
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="activeNavItem"
                      className="absolute left-0 h-8 w-1 rounded-r bg-primary-600"
                    />
                  )}
                </NavLink>
              ))}
            </div>

            {isAdmin && (
              <div className="mt-6">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                  Administration
                </p>
                <div className="space-y-1">
                  {adminNavItems.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300'
                            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-white'
                        )
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="border-t border-secondary-200 p-4 dark:border-secondary-800">
            <NavLink
              to="/notifications"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-white"
            >
              <Bell className="h-5 w-5" />
              Notifications
              <span className="ml-auto rounded-full bg-error-500 px-2 py-0.5 text-xs text-white">3</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
