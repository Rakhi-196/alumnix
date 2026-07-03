import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Building2, GraduationCap, Mail, Linkedin, Twitter, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Avatar, Badge, Button, Input, Select, EmptyState } from '@/components/ui';
import type { Profile } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Civil', label: 'Civil' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Business Administration', label: 'Business Administration' },
];

const currentYear = new Date().getFullYear();
const yearOptions = [
  { value: '', label: 'All Years' },
  ...Array.from({ length: 20 }, (_, i) => ({
    value: String(currentYear - i),
    label: `${currentYear - i}`,
  })),
];

export function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchAlumni() {
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('role', 'alumni')
          .order('created_at', { ascending: false });

        if (departmentFilter) {
          query = query.eq('department', departmentFilter);
        }
        if (yearFilter) {
          query = query.eq('graduation_year', parseInt(yearFilter));
        }
        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,current_company.ilike.%${searchQuery}%,job_title.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          setAlumni(data);
        }
      } catch (error) {
        console.error('Error fetching alumni:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlumni();
  }, [searchQuery, departmentFilter, yearFilter]);

  const filteredAlumni = useMemo(() => {
    return alumni;
  }, [alumni]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Alumni Directory</h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Connect with {filteredAlumni.length} alumni from our network
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search by name, company, or title..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-col gap-4 rounded-lg border border-secondary-200 bg-secondary-50 p-4 dark:border-secondary-700 dark:bg-secondary-800/50 sm:flex-row"
          >
            <Select
              options={departmentOptions}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              placeholder="Department"
              className="sm:w-48"
            />
            <Select
              options={yearOptions}
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder="Graduation Year"
              className="sm:w-40"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDepartmentFilter('');
                setYearFilter('');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-secondary-200 dark:bg-secondary-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
                    <div className="h-3 w-1/2 rounded bg-secondary-200 dark:bg-secondary-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAlumni.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-12 w-12" />}
          title="No alumni found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAlumni.map((person) => (
            <motion.div key={person.id} variants={item}>
              <Card hoverable className="h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar
                      src={person.avatar_url}
                      name={person.full_name}
                      size="xl"
                      className="mb-4"
                    />
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {person.full_name}
                    </h3>
                    {person.job_title && (
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {person.job_title}
                      </p>
                    )}
                    {person.current_company && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-secondary-500 dark:text-secondary-500">
                        <Building2 className="h-3.5 w-3.5" />
                        {person.current_company}
                      </div>
                    )}
                    {person.location && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-secondary-500 dark:text-secondary-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {person.location}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {person.department && (
                      <Badge variant="primary">{person.department}</Badge>
                    )}
                    {person.graduation_year && (
                      <Badge variant="secondary">Class of {person.graduation_year}</Badge>
                    )}
                    {person.is_verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>

                  {person.skills && person.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-1">
                      {person.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="rounded bg-secondary-100 px-2 py-0.5 text-xs text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400"
                        >
                          {skill}
                        </span>
                      ))}
                      {person.skills.length > 4 && (
                        <span className="text-xs text-secondary-500 dark:text-secondary-500">
                          +{person.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex justify-center gap-2">
                    {person.linkedin_url && (
                      <a
                        href={person.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-400 transition-colors hover:text-primary-600"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {person.twitter_url && (
                      <a
                        href={person.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-400 transition-colors hover:text-primary-500"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {person.website_url && (
                      <a
                        href={person.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-400 transition-colors hover:text-primary-600"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    <a
                      href={`mailto:${person.email}`}
                      className="text-secondary-400 transition-colors hover:text-primary-600"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
