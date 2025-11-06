'use client';

import { ReactNode } from 'react';
import { useAuthGuard } from '@/lib/withAuth';
import AdminSidebar from '@/components/AdminSidebar';
import AppBar from '@/components/AppBar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuthGuard({
    requireAuth: true,
    allowedRoles: ['admin', 'manager', 'security'], // Allow admin, manager, and security roles
    redirectTo: '/login'
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" aria-hidden="true"></div>
          <span className="mt-4 text-gray-600">Loading...</span>
          <span className="sr-only">Loading, please wait</span>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (useAuthGuard will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      <AdminSidebar />

      <div className="lg:pl-64 pt-6 lg:pt-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
