export type UserRole = 'admin' | 'alumni' | 'student';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EventType = 'networking' | 'workshop' | 'webinar' | 'reunion' | 'career_fair' | 'other';
export type JobStatus = 'active' | 'closed' | 'draft';
export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'freelance';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
export type NewsCategory = 'announcement' | 'achievement' | 'event' | 'job' | 'general';
export type NewsStatus = 'draft' | 'published' | 'archived';
export type MentorshipStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type RoomType = 'direct' | 'group';
export type NotificationType = 'event' | 'job' | 'message' | 'mentorship' | 'system' | 'news';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  graduation_year?: number;
  department?: string;
  current_company?: string;
  job_title?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  phone?: string;
  skills: string[];
  is_verified: boolean;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: EventType;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_virtual: boolean;
  meeting_link?: string;
  image_url?: string;
  max_attendees?: number;
  created_by: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  registrations?: EventRegistration[];
  registration_count?: number;
  is_registered?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: ApplicationStatus;
  created_at: string;
  user?: Profile;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  job_type: JobType;
  department?: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  application_url?: string;
  posted_by: string;
  status: JobStatus;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  poster?: Profile;
  applications?: JobApplication[];
  application_count?: number;
  has_applied?: boolean;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  applicant?: Profile;
  job?: Job;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: NewsCategory;
  image_url?: string;
  author_id: string;
  is_pinned: boolean;
  status: NewsStatus;
  created_at: string;
  updated_at: string;
  author?: Profile;
  comments?: NewsComment[];
  comment_count?: number;
}

export interface NewsComment {
  id: string;
  news_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: MentorshipStatus;
  expertise_area: string;
  goals?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  mentor?: Profile;
  mentee?: Profile;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: RoomType;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: ChatRoomMember[];
  last_message?: Message;
  unread_count?: number;
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  last_read_at?: string;
  joined_at: string;
  user?: Profile;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  read_at?: string;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content?: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_alumni: number;
  total_students: number;
  total_events: number;
  upcoming_events: number;
  total_jobs: number;
  active_jobs: number;
  total_mentorships: number;
  active_mentorships: number;
  unread_notifications: number;
}
