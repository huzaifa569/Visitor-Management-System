'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>

          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Current user:</span> {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Role:</span> {user.role}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Link>
            
            <Link
              href="/login"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>

            {user && (
              <button
                onClick={logout}
                className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 transition-colors"
              >
                Logout and Login as Different User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
