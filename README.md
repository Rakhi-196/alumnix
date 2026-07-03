# 🎓 Alumni Management System

A modern full-stack Alumni Management Platform built with **React, TypeScript, Vite, and Supabase** that enables alumni, students, and administrators to connect through networking, mentorship, events, job opportunities, and real-time communication.

---

## 🌐 Live Demo

**Live Website:**  
https://alumnix.vercel.app

## 📂 GitHub Repository

**GitHub:**  
https://github.com/Rakhi-196/alumnix

---

# ✨ Features

- ✅ Secure Authentication (Email & Password)
- ✅ Role-Based Access (Admin, Alumni, Student)
- ✅ Alumni Directory with Search & Filters
- ✅ Events Creation & Registration
- ✅ Job Portal with Applications
- ✅ Mentorship Program
- ✅ Real-time Chat
- ✅ News Feed & Announcements
- ✅ Notifications System
- ✅ Profile Management
- ✅ Admin Dashboard
- ✅ Responsive Design
- ✅ Dark/Light Theme

---

# 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Realtime | Supabase Realtime |
| Form Handling | React Hook Form |
| Validation | Zod |
| Animation | Framer Motion |
| Deployment | Vercel |

---

# 🏗 System Architecture

```text
                React + TypeScript
                        │
                        ▼
                  Supabase Auth
                        │
                        ▼
                PostgreSQL Database
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     Events          Jobs          Mentorship
        │               │               │
        └───────────────┼───────────────┘
                        ▼
               Realtime Notifications
                        │
                        ▼
                  Chat & Messaging
```

---

# 📁 Project Structure

```text
src/
├── components/
│   ├── ui/
│   └── layout/
│
├── context/
│   ├── AuthContext
│   └── ThemeContext
│
├── lib/
│   └── supabase.ts
│
├── pages/
│   ├── admin/
│   ├── alumni/
│   ├── auth/
│   ├── chat/
│   ├── dashboard/
│   ├── events/
│   ├── jobs/
│   ├── mentorship/
│   ├── news/
│   ├── notifications/
│   └── profile/
│
├── types/
├── utils/
│
├── App.tsx
└── main.tsx
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm
- Supabase Account

---

## Installation

Clone the repository

```bash
git clone https://github.com/Rakhi-196/alumnix.git
```

Move into the project

```bash
cd alumnix
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Build for production

```bash
npm run build
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

# 👥 User Roles

## 👑 Admin

- Manage Users
- Verify Alumni
- Manage Events
- Manage Jobs
- Publish News
- View Analytics Dashboard

## 🎓 Alumni

- Update Profile
- Post Jobs
- Create Events
- Become Mentor
- Chat with Students
- Share News

## 👨‍🎓 Student

- Search Alumni
- Apply for Jobs
- Register for Events
- Request Mentorship
- Chat with Alumni

---

# 📚 Database Schema

The project uses **12 relational tables**.

| Table | Description |
|--------|-------------|
| profiles | User information |
| events | Alumni events |
| event_registrations | Event registrations |
| jobs | Job postings |
| job_applications | Job applications |
| news_posts | Community news |
| news_comments | Comments |
| mentorships | Mentor-Mentee mapping |
| chat_rooms | Chat rooms |
| chat_room_members | Members |
| messages | Chat messages |
| notifications | User notifications |

---

# 🔄 Project Workflow

```text
User
 │
 ▼
Login / Register
 │
 ▼
Dashboard
 │
 ├──────────────┬──────────────┬──────────────┐
 ▼              ▼              ▼              ▼
Events        Jobs        Mentorship      Profile
 │              │              │              │
 └──────────────┴──────────────┴──────────────┘
                │
                ▼
        Notifications & Chat
```

---

# 🔗 API Reference

## Authentication

```typescript
signUp(email, password, fullName, role)

signIn(email, password)

signOut()
```

## Common Queries

```typescript
// Get Alumni
supabase.from("profiles").select("*").eq("role", "alumni")

// Get Upcoming Events
supabase.from("events").select("*").eq("status", "upcoming")

// Get Active Jobs
supabase.from("jobs").select("*").eq("status", "active")
```

---

# 🚀 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Supabase |
| Database | PostgreSQL |

**Live URL:**  
https://alumnix.vercel.app

---

# 🌟 Future Enhancements

- Google Authentication
- Email Verification
- Resume Upload
- AI Career Recommendation
- Event QR Code Check-In
- Video Meeting Integration
- Push Notifications
- Mobile Application
- Alumni Donation Portal
- Advanced Analytics Dashboard

---

# 👩‍💻 Author

**Rakhi Chauhan**

GitHub:  
https://github.com/Rakhi-196

---

# 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you found this project helpful, please consider giving it a **Star ⭐** on GitHub.