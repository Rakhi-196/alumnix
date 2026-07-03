import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UsersRound,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import type { Profile, Mentorship, MentorshipStatus } from '@/types';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const expertiseOptions = [
  { value: '', label: 'All Areas' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Product Management', label: 'Product Management' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Mobile Development', label: 'Mobile Development' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'System Design', label: 'System Design' },
  { value: 'Career Guidance', label: 'Career Guidance' },
];

export function MentorshipPage() {
  const { profile, isAlumni } = useAuth();
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);

  useEffect(() => {
    fetchMentors();
    fetchMentorships();
  }, [searchQuery, expertiseFilter]);

  async function fetchMentors() {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'alumni')
        .eq('is_verified', true);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,skills.cs.{${searchQuery}}`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setMentors(data);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  }

  async function fetchMentorships() {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*, mentor:profiles!mentorships_mentor_id_fkey(*), mentee:profiles!mentorships_mentee_id_fkey(*)')
        .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMentorships(data);
      }
    } catch (error) {
      console.error('Error fetching mentorships:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRequestMentorship = async (expertise: string, goals: string) => {
    if (!profile || !selectedMentor) return;

    const { error } = await supabase.from('mentorships').insert({
      mentor_id: selectedMentor.id,
      mentee_id: profile.id,
      expertise_area: expertise,
      goals,
    });

    if (error) {
      toast.error('Failed to request mentorship', { description: error.message });
    } else {
      toast.success('Mentorship request sent!');
      setShowRequestModal(false);
      fetchMentorships();
    }
  };

  const handleUpdateStatus = async (mentorshipId: string, status: MentorshipStatus) => {
    const { error } = await supabase
      .from('mentorships')
      .update({ status })
      .eq('id', mentorshipId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Mentorship ${status}`);
      fetchMentorships();
    }
  };

  const myMentorships = mentorships.filter((m) => m.mentor_id === profile?.id);
  const asMentee = mentorships.filter((m) => m.mentee_id === profile?.id);

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
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Mentorship</h1>
            <p className="mt-1 text-secondary-600 dark:text-secondary-400">
              Find a mentor or become one
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="find-mentor">
              <div className="border-b border-secondary-200 px-6 pt-4 dark:border-secondary-700">
                <TabsList>
                  <TabsTrigger value="find-mentor">Find a Mentor</TabsTrigger>
                  <TabsTrigger value="my-mentorships">My Mentorships</TabsTrigger>
                  {isAlumni && <TabsTrigger value="requests">Requests</TabsTrigger>}
                </TabsList>
              </div>

              <TabsContent value="find-mentor" className="p-6">
                <div className="mb-4 flex gap-3">
                  <Input
                    placeholder="Search by name or skill..."
                    leftIcon={<Search className="h-4 w-4" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    options={expertiseOptions}
                    value={expertiseFilter}
                    onChange={(e) => setExpertiseFilter(e.target.value)}
                    className="w-48"
                  />
                </div>

                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse p-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-secondary-200 dark:bg-secondary-700" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 rounded bg-secondary-200 dark:bg-secondary-700" />
                            <div className="h-3 w-24 rounded bg-secondary-200 dark:bg-secondary-700" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : mentors.length === 0 ? (
                  <EmptyState
                    icon={<UsersRound className="h-12 w-12" />}
                    title="No mentors found"
                    description="Try adjusting your search criteria."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mentors.map((mentor) => (
                      <Card key={mentor.id} hoverable className="text-center">
                        <CardContent className="p-6">
                          <Avatar
                            src={mentor.avatar_url}
                            name={mentor.full_name}
                            size="xl"
                            className="mx-auto mb-3"
                          />
                          <h3 className="font-semibold text-secondary-900 dark:text-white">
                            {mentor.full_name}
                          </h3>
                          {mentor.job_title && (
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                              {mentor.job_title}
                            </p>
                          )}
                          {mentor.current_company && (
                            <p className="text-sm text-secondary-500 dark:text-secondary-500">
                              {mentor.current_company}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap justify-center gap-1">
                            {mentor.skills?.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="primary" size="sm">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            className="mt-4"
                            size="sm"
                            onClick={() => {
                              setSelectedMentor(mentor);
                              setShowRequestModal(true);
                            }}
                            leftIcon={<UserPlus className="h-4 w-4" />}
                          >
                            Request Mentorship
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-mentorships" className="p-6">
                {asMentee.length === 0 ? (
                  <EmptyState
                    icon={<UsersRound className="h-12 w-12" />}
                    title="No mentorships yet"
                    description="Find a mentor to get started with your journey."
                  />
                ) : (
                  <div className="space-y-4">
                    {asMentee.map((m) => (
                      <MentorshipCard
                        key={m.id}
                        mentorship={m}
                        isMentor={false}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {isAlumni && (
                <TabsContent value="requests" className="p-6">
                  {myMentorships.length === 0 ? (
                    <EmptyState
                      icon={<UsersRound className="h-12 w-12" />}
                      title="No mentorship requests"
                      description="When someone requests you as a mentor, it will appear here."
                    />
                  ) : (
                    <div className="space-y-4">
                      {myMentorships.map((m) => (
                        <MentorshipCard
                          key={m.id}
                          mentorship={m}
                          isMentor={true}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Mentorship"
        size="md"
      >
        {selectedMentor && (
          <MentorshipRequestForm
            mentor={selectedMentor}
            onSubmit={handleRequestMentorship}
            onCancel={() => setShowRequestModal(false)}
          />
        )}
      </Modal>
    </motion.div>
  );
}

interface MentorshipCardProps {
  mentorship: Mentorship;
  isMentor: boolean;
  onUpdateStatus: (id: string, status: MentorshipStatus) => void;
}

function MentorshipCard({ mentorship, isMentor, onUpdateStatus }: MentorshipCardProps) {
  const otherPerson = isMentor ? mentorship.mentee : mentorship.mentor;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar src={otherPerson?.avatar_url} name={otherPerson?.full_name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-secondary-900 dark:text-white">
                {otherPerson?.full_name}
              </h4>
              <StatusBadge status={mentorship.status} />
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {isMentor ? 'Mentee' : 'Mentor'}
            </p>
            <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
              <span className="font-medium">Expertise:</span> {mentorship.expertise_area}
            </p>
            {mentorship.goals && (
              <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                <span className="font-medium">Goals:</span> {mentorship.goals}
              </p>
            )}
          </div>
          {isMentor && mentorship.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => onUpdateStatus(mentorship.id, 'active')}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onUpdateStatus(mentorship.id, 'cancelled')}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: MentorshipStatus }) {
  const config = {
    pending: { variant: 'warning' as const, icon: <Clock className="h-3 w-3" /> },
    active: { variant: 'success' as const, icon: <CheckCircle className="h-3 w-3" /> },
    completed: { variant: 'primary' as const, icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { variant: 'error' as const, icon: <XCircle className="h-3 w-3" /> },
  };

  const { variant, icon } = config[status];

  return (
    <Badge variant={variant}>
      {icon}
      <span className="ml-1 capitalize">{status}</span>
    </Badge>
  );
}

interface MentorshipRequestFormProps {
  mentor: Profile;
  onSubmit: (expertise: string, goals: string) => void;
  onCancel: () => void;
}

function MentorshipRequestForm({ mentor, onSubmit, onCancel }: MentorshipRequestFormProps) {
  const [expertise, setExpertise] = useState('');
  const [goals, setGoals] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-secondary-50 p-3 dark:bg-secondary-800">
        <Avatar src={mentor.avatar_url} name={mentor.full_name} size="md" />
        <div>
          <p className="font-medium text-secondary-900 dark:text-white">{mentor.full_name}</p>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            {mentor.job_title} at {mentor.current_company}
          </p>
        </div>
      </div>

      <Select
        label="Expertise Area"
        options={expertiseOptions.filter((o) => o.value)}
        value={expertise}
        onChange={(e) => setExpertise(e.target.value)}
      />
      <Textarea
        label="What are your goals?"
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        placeholder="Describe what you hope to achieve from this mentorship..."
      />

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(expertise, goals)} disabled={!expertise || !goals}>
          Send Request
        </Button>
      </div>
    </div>
  );
}
