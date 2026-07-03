import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  UsersRound,
  Shield,
  BarChart3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  Avatar,
  Badge,
  Button,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import type { Profile, Event, Job, DashboardStats } from '@/types';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AdminPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  async function fetchAdminData() {
    try {
      const [users, alumniCount, studentsCount, eventsCount, upcomingEvents, jobsCount, activeJobs, mentorshipsCount, activeMentorships] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'alumni'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('mentorships').select('*', { count: 'exact', head: true }),
        supabase.from('mentorships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      setStats({
        total_alumni: alumniCount.count || 0,
        total_students: studentsCount.count || 0,
        total_events: eventsCount.count || 0,
        upcoming_events: upcomingEvents.count || 0,
        total_jobs: jobsCount.count || 0,
        active_jobs: activeJobs.count || 0,
        total_mentorships: mentorshipsCount.count || 0,
        active_mentorships: activeMentorships.count || 0,
        unread_notifications: 0,
      });

      if (users.data) {
        setRecentUsers(users.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to verify user');
    } else {
      toast.success('User verified');
      fetchAdminData();
    }
  };

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Admin Panel</h1>
            <p className="mt-1 text-secondary-600 dark:text-secondary-400">
              Manage users, content, and system settings
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Alumni"
          value={stats?.total_alumni || 0}
          icon={<Users className="h-5 w-5" />}
          color="bg-primary-500"
          trend="+12%"
          trendUp
        />
        <StatCard
          label="Total Students"
          value={stats?.total_students || 0}
          icon={<Users className="h-5 w-5" />}
          color="bg-accent-500"
          trend="+8%"
          trendUp
        />
        <StatCard
          label="Active Jobs"
          value={stats?.active_jobs || 0}
          icon={<Briefcase className="h-5 w-5" />}
          color="bg-success-500"
          trend="+23%"
          trendUp
        />
        <StatCard
          label="Active Mentorships"
          value={stats?.active_mentorships || 0}
          icon={<UsersRound className="h-5 w-5" />}
          color="bg-warning-500"
          trend="+5%"
          trendUp
        />
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="overview">
              <div className="border-b border-secondary-200 px-6 pt-4 dark:border-secondary-700">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 font-semibold text-secondary-900 dark:text-white">
                      Recent Users
                    </h3>
                    <div className="space-y-3">
                      {recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between rounded-lg border border-secondary-200 p-3 dark:border-secondary-700"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {user.full_name}
                              </p>
                              <Badge variant={user.role === 'admin' ? 'error' : user.role === 'alumni' ? 'primary' : 'secondary'} size="sm">
                                {user.role}
                              </Badge>
                            </div>
                          </div>
                          {!user.is_verified && (
                            <Button size="sm" variant="outline" onClick={() => handleVerifyUser(user.id)}>
                              Verify
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 font-semibold text-secondary-900 dark:text-white">
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-secondary-200 p-4 dark:border-secondary-700">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-600 dark:text-secondary-400">Total Events</span>
                          <span className="text-xl font-bold text-secondary-900 dark:text-white">
                            {stats?.total_events}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Badge variant="success">{stats?.upcoming_events} upcoming</Badge>
                        </div>
                      </div>
                      <div className="rounded-lg border border-secondary-200 p-4 dark:border-secondary-700">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-600 dark:text-secondary-400">Total Jobs Posted</span>
                          <span className="text-xl font-bold text-secondary-900 dark:text-white">
                            {stats?.total_jobs}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Badge variant="success">{stats?.active_jobs} active</Badge>
                        </div>
                      </div>
                      <div className="rounded-lg border border-secondary-200 p-4 dark:border-secondary-700">
                        <div className="flex items-center justify-between">
                          <span className="text-secondary-600 dark:text-secondary-400">Mentorships</span>
                          <span className="text-xl font-bold text-secondary-900 dark:text-white">
                            {stats?.total_mentorships}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Badge variant="success">{stats?.active_mentorships} active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">User Management</h3>
                  <div className="flex gap-2">
                    <Select
                      options={[
                        { value: '', label: 'All Roles' },
                        { value: 'admin', label: 'Admin' },
                        { value: 'alumni', label: 'Alumni' },
                        { value: 'student', label: 'Student' },
                      ]}
                    />
                  </div>
                </div>
                <AdminUserTable onVerify={handleVerifyUser} />
              </TabsContent>

              <TabsContent value="content" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 font-semibold text-secondary-900 dark:text-white">Recent Events</h3>
                    <AdminEventsTable />
                  </div>
                  <div>
                    <h3 className="mb-4 font-semibold text-secondary-900 dark:text-white">Recent Jobs</h3>
                    <AdminJobsTable />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="p-6">
                <div className="rounded-lg border border-secondary-200 p-8 dark:border-secondary-700">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-secondary-400" />
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-white">Analytics Dashboard</h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        Detailed analytics coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ label, value, icon, color, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`rounded-lg p-3 ${color} text-white`}>{icon}</div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-success-600' : 'text-error-600'}`}>
              {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {trend}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-secondary-900 dark:text-white">{value}</p>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminUserTable({ onVerify }: { onVerify: (id: string) => void }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded bg-secondary-200 dark:bg-secondary-700" />)}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-secondary-200 dark:border-secondary-700">
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">User</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Email</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Role</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Verified</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-secondary-200 dark:border-secondary-700">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                  {user.full_name}
                </div>
              </td>
              <td className="px-4 py-3 text-secondary-600 dark:text-secondary-400">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={user.role === 'admin' ? 'error' : user.role === 'alumni' ? 'primary' : 'secondary'}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={user.is_verified ? 'success' : 'warning'}>
                  {user.is_verified ? 'Yes' : 'No'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {!user.is_verified && (
                  <Button size="sm" variant="ghost" onClick={() => onVerify(user.id)}>
                    Verify
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminEventsTable() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*, profiles!events_created_by_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setEvents(data.map(e => ({ ...e, creator: e.profiles as any })));
      setLoading(false);
    }
    fetchEvents();
  }, []);

  if (loading) return <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded bg-secondary-200 dark:bg-secondary-700" />)}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-secondary-200 dark:border-secondary-700">
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Title</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Date</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Status</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Created By</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-secondary-200 dark:border-secondary-700">
              <td className="px-4 py-3 font-medium text-secondary-900 dark:text-white">{event.title}</td>
              <td className="px-4 py-3 text-secondary-600 dark:text-secondary-400">{event.event_date}</td>
              <td className="px-4 py-3">
                <Badge variant={event.status === 'upcoming' ? 'primary' : event.status === 'completed' ? 'success' : 'secondary'}>
                  {event.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-secondary-600 dark:text-secondary-400">{(event as any).creator?.full_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminJobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('*, profiles!jobs_posted_by_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setJobs(data.map(j => ({ ...j, poster: j.profiles as any })));
      setLoading(false);
    }
    fetchJobs();
  }, []);

  if (loading) return <div className="animate-pulse space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded bg-secondary-200 dark:bg-secondary-700" />)}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-secondary-200 dark:border-secondary-700">
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Title</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Company</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Status</th>
            <th className="px-4 py-3 text-left font-medium text-secondary-600 dark:text-secondary-400">Posted By</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-secondary-200 dark:border-secondary-700">
              <td className="px-4 py-3 font-medium text-secondary-900 dark:text-white">{job.title}</td>
              <td className="px-4 py-3 text-secondary-600 dark:text-secondary-400">{job.company}</td>
              <td className="px-4 py-3">
                <Badge variant={job.status === 'active' ? 'success' : 'secondary'}>
                  {job.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-secondary-600 dark:text-secondary-400">{(job as any).poster?.full_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
