import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CalendarDays,
  Briefcase,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import type { Event, Job, NewsPost, DashboardStats } from '@/types';
import { format } from 'date-fns';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { profile, isAdmin, isAlumni } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          { count: totalAlumni },
          { count: totalStudents },
          { count: totalEvents },
          { count: upcomingEventsCount },
          { count: totalJobs },
          { count: activeJobs },
          { count: totalMentorships },
          { count: activeMentorships },
        ] = await Promise.all([
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
          total_alumni: totalAlumni || 0,
          total_students: totalStudents || 0,
          total_events: totalEvents || 0,
          upcoming_events: upcomingEventsCount || 0,
          total_jobs: totalJobs || 0,
          active_jobs: activeJobs || 0,
          total_mentorships: totalMentorships || 0,
          active_mentorships: activeMentorships || 0,
          unread_notifications: 0,
        });

        const { data: events } = await supabase
          .from('events')
          .select('*, profiles!events_created_by_fkey(full_name, avatar_url)')
          .eq('status', 'upcoming')
          .order('event_date', { ascending: true })
          .limit(3);

        if (events) {
          setUpcomingEvents(events.map(e => ({
            ...e,
            creator: e.profiles as any,
          })));
        }

        const { data: jobs } = await supabase
          .from('jobs')
          .select('*, profiles!jobs_posted_by_fkey(full_name, avatar_url)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4);

        if (jobs) {
          setRecentJobs(jobs.map(j => ({
            ...j,
            poster: j.profiles as any,
          })));
        }

        const { data: news } = await supabase
          .from('news_posts')
          .select('*, profiles!news_posts_author_id_fkey(full_name, avatar_url)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3);

        if (news) {
          setNewsPosts(news.map(n => ({
            ...n,
            author: n.profiles as any,
          })));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Alumni', value: stats?.total_alumni || 0, icon: <Users className="h-5 w-5" />, color: 'bg-primary-500' },
    { label: 'Total Students', value: stats?.total_students || 0, icon: <Users className="h-5 w-5" />, color: 'bg-accent-500' },
    { label: 'Upcoming Events', value: stats?.upcoming_events || 0, icon: <CalendarDays className="h-5 w-5" />, color: 'bg-warning-500' },
    { label: 'Active Jobs', value: stats?.active_jobs || 0, icon: <Briefcase className="h-5 w-5" />, color: 'bg-success-500' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Welcome back, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Here's what's happening in your alumni network
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 rounded-lg border border-secondary-200 p-4 transition-colors hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800/50"
                    >
                      <div className="flex-shrink-0 text-center">
                        <div className="rounded-lg bg-primary-100 px-3 py-2 dark:bg-primary-900/30">
                          <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            {format(new Date(event.event_date), 'MMM')}
                          </p>
                          <p className="text-xl font-bold text-primary-700 dark:text-primary-300">
                            {format(new Date(event.event_date), 'd')}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-900 dark:text-white truncate">
                          {event.title}
                        </h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          {event.location || 'Virtual Event'}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="primary">{event.event_type}</Badge>
                          {event.is_virtual && <Badge variant="secondary">Virtual</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-secondary-600 dark:text-secondary-400 py-8">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Latest News</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              {newsPosts.length > 0 ? (
                <div className="space-y-4">
                  {newsPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border-b border-secondary-200 pb-4 last:border-0 dark:border-secondary-700"
                    >
                      <h4 className="font-medium text-secondary-900 dark:text-white line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="mt-1 text-xs text-secondary-600 dark:text-secondary-400">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </p>
                      <Badge variant="primary" size="sm" className="mt-2">
                        {post.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-secondary-600 dark:text-secondary-400 py-8">
                  No news available
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Job Postings</CardTitle>
            <Button variant="ghost" size="sm">View All Jobs</Button>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg border border-secondary-200 p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-secondary-700 dark:hover:border-primary-600"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
                        <Briefcase className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <Badge variant="success">{job.job_type}</Badge>
                    </div>
                    <h4 className="font-medium text-secondary-900 dark:text-white line-clamp-1">
                      {job.title}
                    </h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {job.company}
                    </p>
                    {job.location && (
                      <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-500">
                        {job.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary-600 dark:text-secondary-400 py-8">
                No job postings available
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {(isAdmin || isAlumni) && (
        <motion.div variants={item}>
          <Card className="border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50 dark:border-primary-800 dark:from-primary-950/50 dark:to-accent-950/50">
            <CardContent className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Become a Mentor
                </h3>
                <p className="mt-1 text-secondary-600 dark:text-secondary-400">
                  Share your knowledge and help students succeed in their careers
                </p>
              </div>
              <Button variant="primary">Start Mentoring</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
