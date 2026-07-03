# Alumni Management System

A full-featured alumni management platform built with React, TypeScript, and Supabase.

## Features

- **Authentication** - Email/password sign-up and sign-in with role-based access (Admin, Alumni, Student)
- **Alumni Directory** - Searchable directory with filters by department, graduation year, and skills
- **Events Management** - Create, browse, and register for events (virtual and in-person)
- **Job Portal** - Post and apply for jobs with application tracking
- **News Feed** - Announcements, achievements, and community updates
- **Mentorship Program** - Connect mentors with mentees
- **Real-time Chat** - Direct and group messaging
- **Notifications** - Activity alerts and updates
- **Profile Management** - Personal info, skills, resume, and social links
- **Admin Panel** - User management, content moderation, and analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **UI Components**: Custom component library with Framer Motion animations
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (already configured)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

The `.env` file contains pre-configured Supabase credentials:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key

## User Roles

1. **Admin**
   - Full access to admin panel
   - Can verify users
   - Can manage events, jobs, and news
   - View analytics dashboard

2. **Alumni**
   - Post jobs
   - Create events
   - Become a mentor
   - Full profile access

3. **Student**
   - Browse alumni directory
   - Apply for jobs
   - Register for events
   - Request mentorship

## Demo Accounts

After running the seed script, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@alumni.edu | admin123 |
| Alumni | john.smith@company.com | alumni123 |
| Student | student@university.edu | student123 |

## Database Schema

The system uses 12 interconnected tables:

- `profiles` - User profiles extending auth.users
- `events` - Alumni events and gatherings
- `event_registrations` - Event attendance tracking
- `jobs` - Job postings
- `job_applications` - Job applications
- `news_posts` - News and announcements
- `news_comments` - Comments on posts
- `mentorships` - Mentor-mentee relationships
- `chat_rooms` - Group and direct message rooms
- `chat_room_members` - Room membership
- `messages` - Chat messages
- `notifications` - User notifications

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── layout/       # Layout components (Sidebar, Header)
├── context/
│   ├── AuthContext   # Authentication state
│   └── ThemeContext  # Theme (dark/light mode)
├── lib/
│   └── supabase.ts   # Supabase client
├── pages/
│   ├── admin/        # Admin panel
│   ├── alumni/       # Alumni directory
│   ├── auth/         # Login/Register
│   ├── chat/         # Messaging
│   ├── dashboard/    # Main dashboard
│   ├── events/       # Events management
│   ├── jobs/         # Job portal
│   ├── mentorship/   # Mentorship program
│   ├── news/         # News feed
│   ├── notifications/# Notifications
│   └── profile/      # Profile management
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## API Reference

### Authentication

```typescript
// Sign up
signUp(email, password, fullName, role)

// Sign in
signIn(email, password)

// Sign out
signOut()
```

### Common Queries

```typescript
// Get alumni profiles
supabase.from('profiles').select('*').eq('role', 'alumni')

// Get upcoming events
supabase.from('events').select('*').eq('status', 'upcoming')

// Get active jobs
supabase.from('jobs').select('*').eq('status', 'active')
```

## Features In Detail

### Dark Mode

Toggle dark mode by clicking the sun/moon icon in the header. The preference is saved to localStorage.

### Responsive Design

The UI is fully responsive and works on mobile, tablet, and desktop devices.

### Real-time Chat

Messages are delivered in real-time using Supabase Realtime subscriptions.

## License

MIT
