import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Select } from '@/components/ui';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['alumni', 'student']),
  graduation_year: z.string().optional(),
  department: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: 'alumni', label: 'Alumni' },
  { value: 'student', label: 'Student' },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
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

export function RegisterPage() {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'alumni' | 'student'>('student');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as 'alumni' | 'student');
    setValue('role', e.target.value as 'alumni' | 'student');
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    const { error } = await signUp(
      data.email,
      data.password,
      data.full_name,
      data.role
    );
    setIsLoading(false);

    if (error) {
      toast.error('Failed to create account', {
        description: error.message,
      });
    } else {
      toast.success('Account created successfully!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Create an account</h2>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Join our alumni network and connect with professionals
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Role"
            options={roleOptions}
            value={selectedRole}
            onChange={handleRoleChange}
            error={errors.role?.message}
          />
          <Select
            label="Graduation Year"
            options={yearOptions}
            placeholder="Select year"
            error={errors.graduation_year?.message}
            {...register('graduation_year')}
          />
        </div>

        <Select
          label="Department"
          options={departmentOptions}
          placeholder="Select department"
          error={errors.department?.message}
          {...register('department')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
        Already have an account?{' '}
        <Link to="/login" className="link font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
