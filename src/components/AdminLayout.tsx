'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AdminSidebar from './AdminSidebar';
import AppBar from './AppBar';
import { AlertCircle } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ 
  children, 
  title = 'Admin Dashboard', 
  description 
}: AdminLayoutProps) {
  const { user, isLoading } = useAuth();

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div 
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium">Access Denied</p>
              <p>You must be logged in to access the admin area.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div 
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium">Access Denied</p>
              <p>You do not have permission to access the admin area.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      <AdminSidebar />
      
      <div className="lg:pl-64 pt-6 lg:pt-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {(title || description) && (
            <div className="mb-8">
              {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
              {description && <p className="mt-2 text-gray-600">{description}</p>}
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
}
