import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { AlumniDirectoryPage } from '@/pages/alumni/AlumniDirectoryPage';
import { EventsPage } from '@/pages/events/EventsPage';
import { JobsPage } from '@/pages/jobs/JobsPage';
import { NewsPage } from '@/pages/news/NewsPage';
import { MentorshipPage } from '@/pages/mentorship/MentorshipPage';
import { ChatPage } from '@/pages/chat/ChatPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { AdminPage } from '@/pages/admin/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="alumni" element={<AlumniDirectoryPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="mentorship" element={<MentorshipPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="admin/users" element={<AdminPage />} />
              <Route path="admin/events" element={<AdminPage />} />
              <Route path="admin/jobs" element={<AdminPage />} />
              <Route path="settings" element={<ProfilePage />} />
            </Route>
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-secondary-800 dark:text-white dark:border-secondary-700',
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
