/*
# Alumni Management System - Initial Schema

This migration creates the complete database structure for an alumni management system
with role-based access control (Admin, Alumni, Student).

## Tables Created:

1. **profiles** - Extends auth.users with additional profile information
   - id (uuid, PK, references auth.users)
   - email (text, unique)
   - full_name (text)
   - avatar_url (text)
   - role (enum: admin, alumni, student)
   - graduation_year (integer)
   - department (text)
   - current_company (text)
   - job_title (text)
   - location (text)
   - bio (text)
   - linkedin_url (text)
   - twitter_url (text)
   - website_url (text)
   - phone (text)
   - skills (text array)
   - is_verified (boolean)
   - resume_url (text)
   - created_at, updated_at (timestamps)

2. **events** - Alumni events and gatherings
   - id, title, description, event_type, date, start_time, end_time
   - location, is_virtual, meeting_link, image_url
   - max_attendees, created_by, status, created_at, updated_at

3. **event_registrations** - Event attendance tracking
   - id, event_id, user_id, status, created_at

4. **jobs** - Job postings by alumni
   - id, title, company, location, job_type, department
   - description, requirements, salary_range
   - application_url, posted_by, status, expires_at
   - created_at, updated_at

5. **job_applications** - Job applications by students/alumni
   - id, job_id, applicant_id, cover_letter, resume_url
   - status, applied_at, updated_at

6. **news_posts** - News feed posts and updates
   - id, title, content, category, image_url
   - author_id, is_pinned, status, created_at, updated_at

7. **news_comments** - Comments on news posts
   - id, news_id, author_id, content, created_at, updated_at

8. **mentorships** - Mentor-mentee relationships
   - id, mentor_id, mentee_id, status, expertise_area
   - goals, notes, created_at, updated_at

9. **chat_rooms** - Group and direct message rooms
   - id, name, type (direct/group), created_by
   - created_at, updated_at

10. **chat_room_members** - Room membership
    - id, room_id, user_id, last_read_at, joined_at

11. **messages** - Chat messages
    - id, room_id, sender_id, content, read_at, created_at

12. **notifications** - User notifications
    - id, user_id, type, title, content, data (jsonb)
    - is_read, created_at

## Security:
- RLS enabled on all tables
- Owner-scoped CRUD policies for user-owned data
- Role-based access control for admin operations
- Proper foreign key constraints and cascading deletes

## Notes:
1. Uses auth.users for authentication (Supabase built-in)
2. All user_id columns default to auth.uid() for seamless inserts
3. Admin role has elevated access through policies
4. Cascade deletes configured for referential integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'alumni', 'student');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE event_type AS ENUM ('networking', 'workshop', 'webinar', 'reunion', 'career_fair', 'other');
CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'internship', 'contract', 'freelance');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted');
CREATE TYPE news_category AS ENUM ('announcement', 'achievement', 'event', 'job', 'general');
CREATE TYPE news_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE mentorship_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE room_type AS ENUM ('direct', 'group');
CREATE TYPE notification_type AS ENUM ('event', 'job', 'message', 'mentorship', 'system', 'news');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'student',
  graduation_year INTEGER,
  department TEXT,
  current_company TEXT,
  job_title TEXT,
  location TEXT,
  bio TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  phone TEXT,
  skills TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'other',
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  image_url TEXT,
  max_attendees INTEGER,
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status event_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type job_type NOT NULL DEFAULT 'full-time',
  department TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  salary_range TEXT,
  application_url TEXT,
  posted_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status job_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- News posts
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category news_category NOT NULL DEFAULT 'general',
  image_url TEXT,
  author_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  status news_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News comments
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorships
CREATE TABLE IF NOT EXISTS mentorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status mentorship_status NOT NULL DEFAULT 'pending',
  expertise_area TEXT NOT NULL,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id)
);

-- Chat rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  type room_type NOT NULL DEFAULT 'direct',
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat room members
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_graduation_year ON profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_status ON news_posts(status);
CREATE INDEX IF NOT EXISTS idx_news_posts_category ON news_posts(category);
CREATE INDEX IF NOT EXISTS idx_news_comments_news ON news_comments(news_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee ON mentorships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- EVENTS POLICIES
DROP POLICY IF EXISTS "events_select_all" ON events;
CREATE POLICY "events_select_all" ON events FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_authenticated" ON events;
CREATE POLICY "events_insert_authenticated" ON events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "events_update_creator_admin" ON events;
CREATE POLICY "events_update_creator_admin" ON events FOR UPDATE
  TO authenticated USING (auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )) WITH CHECK (auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "events_delete_creator_admin" ON events;
CREATE POLICY "events_delete_creator_admin" ON events FOR DELETE
  TO authenticated USING (auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- EVENT REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "event_registrations_select_own" ON event_registrations;
CREATE POLICY "event_registrations_select_own" ON event_registrations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "event_registrations_insert_own" ON event_registrations;
CREATE POLICY "event_registrations_insert_own" ON event_registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_registrations_update_own" ON event_registrations;
CREATE POLICY "event_registrations_update_own" ON event_registrations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_registrations_delete_own" ON event_registrations;
CREATE POLICY "event_registrations_delete_own" ON event_registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- JOBS POLICIES
DROP POLICY IF EXISTS "jobs_select_all" ON jobs;
CREATE POLICY "jobs_select_all" ON jobs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "jobs_insert_alumni_admin" ON jobs;
CREATE POLICY "jobs_insert_alumni_admin" ON jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = posted_by AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('alumni', 'admin')
  ));

DROP POLICY IF EXISTS "jobs_update_poster_admin" ON jobs;
CREATE POLICY "jobs_update_poster_admin" ON jobs FOR UPDATE
  TO authenticated USING (auth.uid() = posted_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )) WITH CHECK (auth.uid() = posted_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "jobs_delete_poster_admin" ON jobs;
CREATE POLICY "jobs_delete_poster_admin" ON jobs FOR DELETE
  TO authenticated USING (auth.uid() = posted_by OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- JOB APPLICATIONS POLICIES
DROP POLICY IF EXISTS "job_applications_select_own_recruiter" ON job_applications;
CREATE POLICY "job_applications_select_own_recruiter" ON job_applications FOR SELECT
  TO authenticated USING (
    auth.uid() = applicant_id OR 
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.posted_by = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "job_applications_insert_own" ON job_applications;
CREATE POLICY "job_applications_insert_own" ON job_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "job_applications_update_own_recruiter" ON job_applications;
CREATE POLICY "job_applications_update_own_recruiter" ON job_applications FOR UPDATE
  TO authenticated USING (
    auth.uid() = applicant_id OR 
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.posted_by = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    auth.uid() = applicant_id OR 
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.posted_by = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "job_applications_delete_own" ON job_applications;
CREATE POLICY "job_applications_delete_own" ON job_applications FOR DELETE
  TO authenticated USING (auth.uid() = applicant_id);

-- NEWS POSTS POLICIES
DROP POLICY IF EXISTS "news_posts_select_all" ON news_posts;
CREATE POLICY "news_posts_select_all" ON news_posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "news_posts_insert_admin" ON news_posts;
CREATE POLICY "news_posts_insert_admin" ON news_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "news_posts_update_admin" ON news_posts;
CREATE POLICY "news_posts_update_admin" ON news_posts FOR UPDATE
  TO authenticated USING (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )) WITH CHECK (auth.uid() = author_id AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "news_posts_delete_admin" ON news_posts;
CREATE POLICY "news_posts_delete_admin" ON news_posts FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- NEWS COMMENTS POLICIES
DROP POLICY IF EXISTS "news_comments_select_all" ON news_comments;
CREATE POLICY "news_comments_select_all" ON news_comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "news_comments_insert_own" ON news_comments;
CREATE POLICY "news_comments_insert_own" ON news_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "news_comments_update_own" ON news_comments;
CREATE POLICY "news_comments_update_own" ON news_comments FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "news_comments_delete_own_admin" ON news_comments;
CREATE POLICY "news_comments_delete_own_admin" ON news_comments FOR DELETE
  TO authenticated USING (
    auth.uid() = author_id OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- MENTORSHIPS POLICIES
DROP POLICY IF EXISTS "mentorships_select_participant" ON mentorships;
CREATE POLICY "mentorships_select_participant" ON mentorships FOR SELECT
  TO authenticated USING (auth.uid() = mentor_id OR auth.uid() = mentee_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "mentorships_insert_mentee" ON mentorships;
CREATE POLICY "mentorships_insert_mentee" ON mentorships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = mentee_id);

DROP POLICY IF EXISTS "mentorships_update_participant" ON mentorships;
CREATE POLICY "mentorships_update_participant" ON mentorships FOR UPDATE
  TO authenticated USING (auth.uid() = mentor_id OR auth.uid() = mentee_id)
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

DROP POLICY IF EXISTS "mentorships_delete_participant" ON mentorships;
CREATE POLICY "mentorships_delete_participant" ON mentorships FOR DELETE
  TO authenticated USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- CHAT ROOMS POLICIES
DROP POLICY IF EXISTS "chat_rooms_select_member" ON chat_rooms;
CREATE POLICY "chat_rooms_select_member" ON chat_rooms FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM chat_room_members WHERE room_id = chat_rooms.id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "chat_rooms_insert_own" ON chat_rooms;
CREATE POLICY "chat_rooms_insert_own" ON chat_rooms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "chat_rooms_update_creator" ON chat_rooms;
CREATE POLICY "chat_rooms_update_creator" ON chat_rooms FOR UPDATE
  TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "chat_rooms_delete_creator" ON chat_rooms;
CREATE POLICY "chat_rooms_delete_creator" ON chat_rooms FOR DELETE
  TO authenticated USING (auth.uid() = created_by);

-- CHAT ROOM MEMBERS POLICIES
DROP POLICY IF EXISTS "chat_room_members_select_member" ON chat_room_members;
CREATE POLICY "chat_room_members_select_member" ON chat_room_members FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM chat_room_members crm WHERE crm.room_id = chat_room_members.room_id AND crm.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "chat_room_members_insert_own" ON chat_room_members;
CREATE POLICY "chat_room_members_insert_own" ON chat_room_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_room_members_update_own" ON chat_room_members;
CREATE POLICY "chat_room_members_update_own" ON chat_room_members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_room_members_delete_own" ON chat_room_members;
CREATE POLICY "chat_room_members_delete_own" ON chat_room_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "messages_select_member" ON messages;
CREATE POLICY "messages_select_member" ON messages FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM chat_room_members WHERE room_id = messages.room_id AND user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "messages_insert_member" ON messages;
CREATE POLICY "messages_insert_member" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM chat_room_members WHERE room_id = messages.room_id AND user_id = auth.uid()
    )
  );

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
CREATE POLICY "notifications_insert_system" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_news_comments_updated_at
  BEFORE UPDATE ON news_comments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_mentorships_updated_at
  BEFORE UPDATE ON mentorships
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();