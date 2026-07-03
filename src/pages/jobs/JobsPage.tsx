import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Plus,
  Search,
  ExternalLink,
  FileText,
  Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  Avatar,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  Textarea,
  EmptyState,
} from '@/components/ui';
import type { Job, JobType } from '@/types';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const jobTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

export function JobsPage() {
  const { isAdmin, isAlumni } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, typeFilter]);

  async function fetchJobs() {
    try {
      let query = supabase
        .from('jobs')
        .select('*, profiles!jobs_posted_by_fkey(id, full_name, avatar_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (typeFilter) {
        query = query.eq('job_type', typeFilter as JobType);
      }
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setJobs(
          data.map((j) => ({
            ...j,
            poster: j.profiles as any,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Job Portal</h1>
            <p className="mt-1 text-secondary-600 dark:text-secondary-400">
              {jobs.length} active positions from alumni
            </p>
          </div>
          {(isAdmin || isAlumni) && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              Post a Job
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search jobs by title or company..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          options={jobTypeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="sm:w-48"
        />
      </motion.div>

      <motion.div variants={item}>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse p-6">
                <div className="h-6 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
                <div className="mt-3 h-4 w-1/2 rounded bg-secondary-200 dark:bg-secondary-700" />
                <div className="mt-6 h-20 rounded bg-secondary-200 dark:bg-secondary-700" />
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-12 w-12" />}
            title="No jobs found"
            description="Try adjusting your search or check back later."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <motion.div key={job.id} variants={item}>
                <JobCard job={job} onViewDetails={() => setSelectedJob(job)} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Post a New Job"
        size="lg"
      >
        <JobForm
          onClose={() => {
            setShowCreateModal(false);
            fetchJobs();
          }}
        />
      </Modal>

      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        size="lg"
      >
        {selectedJob && (
          <JobDetails
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onApply={() => {
              setSelectedJob(null);
              fetchJobs();
            }}
          />
        )}
      </Modal>
    </motion.div>
  );
}

interface JobCardProps {
  job: Job;
  onViewDetails: () => void;
}

function JobCard({ job, onViewDetails }: JobCardProps) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card hoverable onClick={onViewDetails}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
            <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-secondary-900 dark:text-white line-clamp-1">
              {job.title}
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {job.company}
            </p>
          </div>
          <Badge variant={job.job_type === 'full-time' ? 'success' : 'primary'}>
            {job.job_type}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-secondary-600 dark:text-secondary-400">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </div>
          )}
          {job.department && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {job.department}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
          </div>
        </div>

        <p className="mt-3 text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
          {job.description}
        </p>

        {job.salary_range && (
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-success-600 dark:text-success-400">
            <DollarSign className="h-4 w-4" />
            {job.salary_range}
          </div>
        )}

        {job.poster && (
          <div className="mt-4 flex items-center gap-2 border-t border-secondary-200 pt-4 dark:border-secondary-700">
            <Avatar src={job.poster.avatar_url} name={job.poster.full_name} size="sm" />
            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              Posted by {job.poster.full_name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface JobDetailsProps {
  job: Job;
  onClose: () => void;
  onApply: () => void;
}

function JobDetails({ job, onClose, onApply }: JobDetailsProps) {
  const { profile } = useAuth();
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  const handleApply = async () => {
    if (!profile) return;

    setApplying(true);
    const { error } = await supabase.from('job_applications').insert({
      job_id: job.id,
      applicant_id: profile.id,
      cover_letter: coverLetter,
      resume_url: profile.resume_url,
    });

    setApplying(false);

    if (error) {
      toast.error('Failed to apply', { description: error.message });
    } else {
      toast.success('Application submitted!');
      onApply();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary-100 p-4 dark:bg-primary-900/30">
          <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            {job.title}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400">{job.company}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="primary">{job.job_type}</Badge>
        {job.location && <Badge variant="secondary">{job.location}</Badge>}
        {job.department && <Badge variant="secondary">{job.department}</Badge>}
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h4 className="text-secondary-900 dark:text-white">Description</h4>
        <p className="whitespace-pre-wrap text-secondary-600 dark:text-secondary-400">
          {job.description}
        </p>

        {job.requirements && (
          <>
            <h4 className="text-secondary-900 dark:text-white">Requirements</h4>
            <p className="whitespace-pre-wrap text-secondary-600 dark:text-secondary-400">
              {job.requirements}
            </p>
          </>
        )}

        {job.salary_range && (
          <>
            <h4 className="text-secondary-900 dark:text-white">Salary</h4>
            <p className="text-success-600 dark:text-success-400 font-medium">
              {job.salary_range}
            </p>
          </>
        )}
      </div>

      {job.has_applied ? (
        <div className="rounded-lg bg-success-50 p-4 text-center dark:bg-success-900/20">
          <p className="font-medium text-success-700 dark:text-success-400">
            You have already applied for this position
          </p>
        </div>
      ) : showApplyForm ? (
        <div className="space-y-4 rounded-lg border border-secondary-200 p-4 dark:border-secondary-700">
          <Textarea
            label="Cover Letter (optional)"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell us why you're a good fit..."
            rows={4}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowApplyForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} isLoading={applying} leftIcon={<Send className="h-4 w-4" />}>
              Submit Application
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {job.application_url && (
            <Button variant="outline" leftIcon={<ExternalLink className="h-4 w-4" />}>
              <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                External Apply
              </a>
            </Button>
          )}
          <Button onClick={() => setShowApplyForm(true)} leftIcon={<FileText className="h-4 w-4" />}>
            Quick Apply
          </Button>
        </div>
      )}
    </div>
  );
}

interface JobFormProps {
  onClose: () => void;
}

function JobForm({ onClose }: JobFormProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'full-time' as JobType,
    department: '',
    description: '',
    requirements: '',
    salary_range: '',
    application_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    const { error } = await supabase.from('jobs').insert({
      ...formData,
      posted_by: profile.id,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to post job', { description: error.message });
    } else {
      toast.success('Job posted successfully!');
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Job Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
        />
        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., San Francisco, CA"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Job Type"
          options={jobTypeOptions.filter((o) => o.value)}
          value={formData.job_type}
          onChange={(e) => setFormData({ ...formData, job_type: e.target.value as JobType })}
        />
        <Input
          label="Department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="e.g., Engineering"
        />
      </div>
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
        rows={4}
      />
      <Textarea
        label="Requirements"
        value={formData.requirements}
        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Salary Range"
          value={formData.salary_range}
          onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
          placeholder="e.g., $80,000 - $120,000"
        />
        <Input
          label="Application URL (optional)"
          value={formData.application_url}
          onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
          placeholder="External application link"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          Post Job
        </Button>
      </div>
    </form>
  );
}
