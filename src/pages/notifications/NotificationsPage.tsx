import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import {
  Bell,
  CalendarDays,
  Briefcase,
  MessageSquare,
  UsersRound,
  Newspaper,
  Info,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  Button,
  EmptyState,
  Badge,
} from '@/components/ui';
import type { Notification, NotificationType } from '@/types';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  event: <CalendarDays className="h-5 w-5" />,
  job: <Briefcase className="h-5 w-5" />,
  message: <MessageSquare className="h-5 w-5" />,
  mentorship: <UsersRound className="h-5 w-5" />,
  news: <Newspaper className="h-5 w-5" />,
  system: <Info className="h-5 w-5" />,
};

export function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (profile) {
      fetchNotifications();
    }
  }, [profile, filter]);

  async function fetchNotifications() {
    if (!profile) return;

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (!error && data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    }
  };

  const markAllAsRead = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (!error) {
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at);
    let group: string;

    if (isToday(date)) {
      group = 'Today';
    } else if (isYesterday(date)) {
      group = 'Yesterday';
    } else if (isThisWeek(date)) {
      group = 'This Week';
    } else {
      group = format(date, 'MMMM yyyy');
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl space-y-6"
    >
      <motion.div variants={item}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Notifications</h1>
            <p className="mt-1 text-secondary-600 dark:text-secondary-400">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="error" size="sm" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        {loading ? (
          <Card>
            <CardContent className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-secondary-200 dark:bg-secondary-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-secondary-200 dark:bg-secondary-700" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-secondary-200 dark:bg-secondary-700" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-12 w-12" />}
            title="No notifications"
            description={filter === 'unread' ? "You've read everything!" : "You're all caught up."}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                <div key={group}>
                  <div className="border-b border-secondary-200 bg-secondary-50 px-6 py-2 dark:border-secondary-700 dark:bg-secondary-800/50">
                    <h3 className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {group}
                    </h3>
                  </div>
                  <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {groupNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  return (
    <motion.div
      variants={item}
      className={`flex items-start gap-4 p-4 transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-800/50 ${
        !notification.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
          !notification.is_read
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400'
        }`}
      >
        {notificationIcons[notification.type]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''} text-secondary-900 dark:text-white`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <div className="h-2 w-2 rounded-full bg-primary-500" />
          )}
        </div>
        {notification.content && (
          <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
            {notification.content}
          </p>
        )}
        <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-500">
          {format(new Date(notification.created_at), 'h:mm a')}
        </p>
      </div>

      <div className="flex gap-1">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(notification.id)}
          className="h-8 w-8 p-0 text-error-500 hover:text-error-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
