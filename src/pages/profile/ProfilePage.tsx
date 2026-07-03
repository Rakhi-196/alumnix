import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Linkedin,
  Twitter,
  Globe,
  Save,
  Upload,
  FileText,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  Avatar,
  Badge,
  Button,
  Input,
  Select,
  Alert,
} from '@/components/ui';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  current_company: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  graduation_year: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 20 }, (_, i) => ({
  value: String(currentYear - i),
  label: `${currentYear - i}`,
}));

const departmentOptions = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Civil', label: 'Civil' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Other', label: 'Other' },
];

export function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      current_company: profile?.current_company || '',
      job_title: profile?.job_title || '',
      department: profile?.department || '',
      graduation_year: profile?.graduation_year?.toString() || '',
      bio: profile?.bio || '',
      linkedin_url: profile?.linkedin_url || '',
      twitter_url: profile?.twitter_url || '',
      website_url: profile?.website_url || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        current_company: profile.current_company || '',
        job_title: profile.job_title || '',
        department: profile.department || '',
        graduation_year: profile.graduation_year?.toString() || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        website_url: profile.website_url || '',
      });
      setSkills(profile.skills || []);
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    const { error } = await updateProfile({
      ...data,
      graduation_year: data.graduation_year ? parseInt(data.graduation_year) : undefined,
      skills,
    });

    setSaving(false);

    if (error) {
      toast.error('Failed to update profile', { description: error.message });
    } else {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  if (!profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Profile</h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Manage your personal information
          </p>
        </div>
        <Button
          variant={isEditing ? 'secondary' : 'primary'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Card>
        <div className="relative">
          <div className="h-32 w-full rounded-t-xl bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900" />
          <div className="absolute left-6 top-16">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name}
              size="xl"
              className="h-28 w-28 border-4 border-white dark:border-secondary-800"
            />
          </div>
        </div>

        <CardContent className="pt-20">
          {isEditing && (
            <Alert variant="info" className="mb-6">
              Update your profile information. Changes will be saved when you click "Save Changes".
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
                  Personal Information
                </h3>
              </div>

              <Input
                label="Full Name"
                leftIcon={<User className="h-4 w-4" />}
                disabled={!isEditing}
                error={errors.full_name?.message}
                {...register('full_name')}
              />

              <Input
                label="Email"
                type="email"
                leftIcon={<Mail className="h-4 w-4" />}
                disabled
                {...register('email')}
              />

              <Input
                label="Phone"
                type="tel"
                leftIcon={<Phone className="h-4 w-4" />}
                disabled={!isEditing}
                {...register('phone')}
              />

              <Input
                label="Location"
                leftIcon={<MapPin className="h-4 w-4" />}
                disabled={!isEditing}
                placeholder="City, Country"
                {...register('location')}
              />

              {isEditing && (
                <>
                  <textarea
                    placeholder="Tell us about yourself..."
                    rows={4}
                    disabled={!isEditing}
                    {...register('bio')}
                    className="input min-h-[100px] lg:col-span-2"
                  />
                </>
              )}

              {!isEditing && profile.bio && (
                <div className="lg:col-span-2">
                  <label className="label">Bio</label>
                  <p className="text-secondary-700 dark:text-secondary-300">{profile.bio}</p>
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
                  Professional Information
                </h3>
              </div>

              <Input
                label="Current Company"
                leftIcon={<Building2 className="h-4 w-4" />}
                disabled={!isEditing}
                {...register('current_company')}
              />

              <Input
                label="Job Title"
                leftIcon={<Briefcase className="h-4 w-4" />}
                disabled={!isEditing}
                {...register('job_title')}
              />

              <Select
                label="Department"
                options={departmentOptions}
                disabled={!isEditing}
                {...register('department')}
              />

              <Select
                label="Graduation Year"
                options={yearOptions}
                disabled={!isEditing}
                {...register('graduation_year')}
              />

              <div className="lg:col-span-2">
                <label className="label">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="primary"
                      className={isEditing ? 'pr-1' : ''}
                    >
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full p-0.5 hover:bg-primary-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="max-w-xs"
                    />
                    <Button type="button" variant="secondary" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
                  Social Links
                </h3>
              </div>

              <Input
                label="LinkedIn"
                leftIcon={<Linkedin className="h-4 w-4" />}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/..."
                {...register('linkedin_url')}
              />

              <Input
                label="Twitter"
                leftIcon={<Twitter className="h-4 w-4" />}
                disabled={!isEditing}
                placeholder="https://twitter.com/..."
                {...register('twitter_url')}
              />

              <Input
                label="Website"
                leftIcon={<Globe className="h-4 w-4" />}
                disabled={!isEditing}
                placeholder="https://..."
                {...register('website_url')}
              />

              <div className="lg:col-span-2">
                <label className="label">Resume</label>
                {profile.resume_url ? (
                  <div className="flex items-center gap-3">
                    <Badge variant="success" className="gap-1">
                      <FileText className="h-3 w-3" />
                      Resume uploaded
                    </Badge>
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link text-sm"
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    No resume uploaded
                  </p>
                )}
                {isEditing && (
                  <Button variant="secondary" size="sm" className="mt-2">
                    <Upload className="h-4 w-4" />
                    Upload Resume
                  </Button>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end">
                <Button type="submit" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
