import { Outlet, Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary-50 dark:bg-secondary-950">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center text-white">
          <GraduationCap className="mx-auto mb-6 h-20 w-20" />
          <h1 className="mb-4 text-4xl font-bold">AlumniHub</h1>
          <p className="text-lg text-primary-100">
            Connect with fellow alumni, discover opportunities, and grow your professional network.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-primary-200">Alumni</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-primary-200">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1K+</div>
              <div className="text-sm text-primary-200">Jobs</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white p-8 dark:bg-secondary-900">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-primary-600" />
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">AlumniHub</h1>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
