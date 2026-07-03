import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  CalendarDays,
  MapPin,
  Video,
  Users,
  Plus,
  Search,
  Clock,
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
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import type { Event, EventType } from '@/types';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const eventTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'networking', label: 'Networking' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'career_fair', label: 'Career Fair' },
  { value: 'other', label: 'Other' },
];

export function EventsPage() {
  const { profile, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, typeFilter]);

  async function fetchEvents() {
    try {
      let query = supabase
        .from('events')
        .select('*, profiles!events_created_by_fkey(id, full_name, avatar_url)')
        .order('event_date', { ascending: true });

      if (typeFilter) {
        query = query.eq('event_type', typeFilter as EventType);
      }
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setEvents(
          data.map((e) => ({
            ...e,
            creator: e.profiles as any,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const pastEvents = events.filter((e) => e.status === 'completed' || e.status === 'cancelled');

  const handleRegister = async (eventId: string) => {
    if (!profile) return;

    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      user_id: profile.id,
    });

    if (error) {
      toast.error('Failed to register', { description: error.message });
    } else {
      toast.success('Successfully registered for the event!');
      fetchEvents();
    }
  };

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
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Events</h1>
            <p className="mt-1 text-secondary-600 dark:text-secondary-400">
              Discover and attend alumni events
            </p>
          </div>
          {(isAdmin || profile?.role === 'alumni') && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              Create Event
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search events..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          options={eventTypeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="sm:w-48"
        />
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="upcoming">
              <div className="border-b border-secondary-200 px-6 pt-4 dark:border-secondary-700">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
                  <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upcoming" className="p-6">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse space-y-3 rounded-lg border p-4">
                        <div className="h-32 rounded-lg bg-secondary-200 dark:bg-secondary-700" />
                        <div className="h-4 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
                        <div className="h-3 w-1/2 rounded bg-secondary-200 dark:bg-secondary-700" />
                      </div>
                    ))}
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <EmptyState
                    icon={<CalendarDays className="h-12 w-12" />}
                    title="No upcoming events"
                    description="Check back later for new events or create one yourself."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onRegister={handleRegister}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="p-6">
                {pastEvents.length === 0 ? (
                  <EmptyState
                    icon={<CalendarDays className="h-12 w-12" />}
                    title="No past events"
                    description="Events will appear here after they've concluded."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastEvents.map((event) => (
                      <EventCard key={event.id} event={event} onRegister={handleRegister} isPast />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Event"
        size="lg"
      >
        <EventForm
          onClose={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      </Modal>
    </motion.div>
  );
}

interface EventCardProps {
  event: Event;
  onRegister: (eventId: string) => void;
  isPast?: boolean;
}

function EventCard({ event, onRegister, isPast }: EventCardProps) {
  return (
    <motion.div variants={item}>
      <Card className={`h-full ${isPast ? 'opacity-75' : ''}`}>
        <CardContent className="p-0">
          <div className="relative">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="h-32 w-full rounded-t-xl object-cover"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-primary-500 to-primary-700">
                <CalendarDays className="h-12 w-12 text-white/80" />
              </div>
            )}
            <Badge variant="primary" className="absolute left-3 top-3">
              {event.event_type}
            </Badge>
            {event.is_virtual && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs text-secondary-700 dark:bg-secondary-800/90 dark:text-secondary-300">
                <Video className="h-3 w-3" />
                Virtual
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-secondary-900 dark:text-white line-clamp-1">
              {event.title}
            </h3>

            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
              </div>
              {event.start_time && (
                <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <Clock className="h-4 w-4" />
                  {event.start_time}
                  {event.end_time && ` - ${event.end_time}`}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                <MapPin className="h-4 w-4" />
                {event.location || 'Online'}
              </div>
              <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                <Users className="h-4 w-4" />
                {event.registration_count || 0} registered
              </div>
            </div>

            {event.creator && (
              <div className="mt-3 flex items-center gap-2 border-t border-secondary-200 pt-3 dark:border-secondary-700">
                <Avatar
                  src={event.creator.avatar_url}
                  name={event.creator.full_name}
                  size="sm"
                />
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  By {event.creator.full_name}
                </span>
              </div>
            )}

            {!isPast && !event.is_registered && (
              <Button
                className="mt-4 w-full"
                size="sm"
                onClick={() => onRegister(event.id)}
              >
                Register Now
              </Button>
            )}
            {!isPast && event.is_registered && (
              <Badge variant="success" className="mt-4 w-full justify-center py-2">
                Registered
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface EventFormProps {
  onClose: () => void;
}

function EventForm({ onClose }: EventFormProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'networking' as EventType,
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    is_virtual: false,
    meeting_link: '',
    max_attendees: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    const { error } = await supabase.from('events').insert({
      ...formData,
      created_by: profile.id,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to create event', { description: error.message });
    } else {
      toast.success('Event created successfully!');
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <Select
        label="Event Type"
        options={eventTypeOptions.filter((o) => o.value)}
        value={formData.event_type}
        onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
      />
      <Input
        label="Event Date"
        type="date"
        value={formData.event_date}
        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Time"
          type="time"
          value={formData.start_time}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
        />
        <Input
          label="End Time"
          type="time"
          value={formData.end_time}
          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
        />
      </div>
      <Input
        label="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="Event venue or 'Online'"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.is_virtual}
          onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
          className="rounded border-secondary-300 text-primary-600"
        />
        <span className="text-sm text-secondary-700 dark:text-secondary-300">
          This is a virtual event
        </span>
      </label>
      {formData.is_virtual && (
        <Input
          label="Meeting Link"
          value={formData.meeting_link}
          onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
          placeholder="Zoom, Google Meet, etc."
        />
      )}
      <Input
        label="Max Attendees (optional)"
        type="number"
        value={formData.max_attendees}
        onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
        placeholder="Leave empty for unlimited"
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          Create Event
        </Button>
      </div>
    </form>
  );
}
