/*
# Seed Data for Alumni Management System

Populates database with demo data. Run this AFTER creating at least one user account.
*/

-- Only insert if there are existing profiles
DO $$
DECLARE
    first_profile_id uuid;
    admin_profile_id uuid;
BEGIN
    -- Get the first profile
    SELECT id INTO first_profile_id FROM profiles LIMIT 1;
    
    -- Get an admin profile if exists
    SELECT id INTO admin_profile_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    -- Insert events if we have a profile
    IF first_profile_id IS NOT NULL THEN
        INSERT INTO events (id, title, description, event_type, event_date, start_time, end_time, location, is_virtual, meeting_link, status, created_by) VALUES
            (gen_random_uuid(), 'Annual Alumni Homecoming 2026', 'Join us for our biggest event of the year! Network with fellow alumni, attend workshops, and reconnect with old friends.', 'reunion', '2026-08-15', '10:00', '18:00', 'University Main Campus', false, null, 'upcoming', first_profile_id),
            (gen_random_uuid(), 'Tech Industry Networking Night', 'Connect with alumni working in tech. Virtual event featuring panel discussions and breakout rooms.', 'networking', '2026-07-20', '19:00', '21:00', 'Online', true, 'https://zoom.us/meeting/demo', 'upcoming', first_profile_id),
            (gen_random_uuid(), 'Career Workshop: Resume Building', 'Learn how to craft the perfect resume from HR professionals at top companies.', 'workshop', '2026-07-25', '14:00', '16:00', 'Virtual', true, 'https://meet.google.com/demo', 'upcoming', first_profile_id),
            (gen_random_uuid(), 'Startup Founder Meetup', 'Connect with alumni entrepreneurs and share your startup journey.', 'networking', '2026-06-10', '18:00', '20:00', 'Innovation Hub, Downtown', false, null, 'completed', first_profile_id),
            (gen_random_uuid(), 'Web Development Bootcamp', 'Intensive 3-day workshop on modern web development practices.', 'workshop', '2026-05-15', '09:00', '17:00', 'Tech Center', false, null, 'completed', first_profile_id);

        -- Insert jobs
        INSERT INTO jobs (id, title, company, location, job_type, department, description, requirements, salary_range, status, posted_by) VALUES
            (gen_random_uuid(), 'Senior Software Engineer', 'TechCorp Inc.', 'San Francisco, CA', 'full-time', 'Engineering', 'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing and implementing scalable backend systems.', '5+ years experience in software development. Proficiency in Python, Go, or Java. Experience with cloud platforms (AWS/GCP). Strong problem-solving skills', '$150,000 - $200,000', 'active', first_profile_id),
            (gen_random_uuid(), 'Product Manager', 'InnovateTech', 'New York, NY', 'full-time', 'Product', 'Lead product strategy and roadmap for our B2B SaaS platform. Work closely with engineering, design, and sales teams.', '3+ years product management experience. MBA preferred. Experience with agile methodologies. Strong analytical skills', '$130,000 - $160,000', 'active', first_profile_id),
            (gen_random_uuid(), 'Data Scientist', 'Analytics Pro', 'Remote', 'full-time', 'Data Science', 'Join our data science team to build ML models that power our recommendations engine.', 'MS or PhD in Computer Science, Statistics, or related field. Experience with Python, TensorFlow, PyTorch. Knowledge of NLP and deep learning', '$140,000 - $180,000', 'active', first_profile_id),
            (gen_random_uuid(), 'Frontend Developer Intern', 'StartupXYZ', 'Austin, TX', 'internship', 'Engineering', '12-week summer internship for students interested in frontend development.', 'Currently pursuing CS degree. Knowledge of React or Vue.js. Passion for building great user experiences', '$30/hour', 'active', first_profile_id),
            (gen_random_uuid(), 'UX Designer', 'DesignStudio', 'Los Angeles, CA', 'full-time', 'Design', 'Create beautiful and intuitive user experiences for our client projects.', 'Portfolio demonstrating UX process. Proficiency in Figma, Sketch. Experience with user research', '$100,000 - $130,000', 'active', first_profile_id),
            (gen_random_uuid(), 'DevOps Engineer', 'CloudFirst', 'Seattle, WA', 'full-time', 'Infrastructure', 'Build and maintain our cloud infrastructure. Looking for someone with strong automation skills.', 'Experience with Kubernetes, Docker. Knowledge of CI/CD pipelines. AWS certification preferred', '$140,000 - $170,000', 'active', first_profile_id);

        -- Create group chat
        INSERT INTO chat_rooms (id, name, type, created_by) VALUES
            (gen_random_uuid(), 'General Discussion', 'group', first_profile_id);
    END IF;
    
    -- Insert news posts (use admin if available, otherwise first profile)
    IF coalesce(admin_profile_id, first_profile_id) IS NOT NULL THEN
        INSERT INTO news_posts (id, title, content, category, status, author_id) VALUES
            (gen_random_uuid(), 'Welcome to AlumniHub!', 'We are excited to launch our new alumni management platform. This platform will help you stay connected with fellow alumni, discover job opportunities, and participate in exclusive events.', 'announcement', 'published', coalesce(admin_profile_id, first_profile_id)),
            (gen_random_uuid(), 'Class of 2020 Alumni achieving great success', 'Several alumni from the Class of 2020 have been recognized for their outstanding achievements in their respective fields. Congratulations to all!', 'achievement', 'published', coalesce(admin_profile_id, first_profile_id)),
            (gen_random_uuid(), 'Upcoming Industry Trends for 2026', 'Stay ahead of the curve with our analysis of emerging industry trends. This article covers AI, sustainability, and the future of work.', 'general', 'published', coalesce(admin_profile_id, first_profile_id)),
            (gen_random_uuid(), 'Summer Networking Event Recap', 'Thanks to everyone who attended our summer networking event! Over 200 alumni participated, making it our largest event yet.', 'event', 'published', coalesce(admin_profile_id, first_profile_id)),
            (gen_random_uuid(), 'New Job Board Features Released', 'We have upgraded our job board with new features including instant apply, salary insights, and company reviews.', 'announcement', 'published', coalesce(admin_profile_id, first_profile_id));
    END IF;
END $$;
