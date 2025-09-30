'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { newVisitorAPI, visitorAPI } from '@/lib/api';
import { VisitorForm } from '@/lib/api';

export default function VisitorCheckIn() {
  const [visitor, setVisitor] = useState<VisitorForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchVisitor = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const visitorId = Array.isArray(id) ? id[0] : id;
        const data = await newVisitorAPI.getSingleVisitorById(visitorId);
        setVisitor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch visitor details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitor();
  }, [id, token]);

  const handleCheckIn = async () => {
    if (!visitor || !id) return;

    try {
      setCheckingIn(true);
      const visitorId = Array.isArray(id) ? id[0] : id;
      await visitorAPI.checkInVisitor(visitorId, token || '');
      setSuccess('Check-in successful! Generating your digital visitor badge...');

      // Update visitor status locally
      setVisitor(prev => prev ? {
        ...prev,
        status: 'checked-in',
        checkInTime: new Date().toISOString()
      } : null);

      // Redirect to badge page after 1 second
      setTimeout(() => {
        router.push(`/badge/${visitorId}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-100 px-4 py-6">
      {/* Navbar */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-20">
        <Link href="/" className="text-2xl md:text-3xl font-bold text-blue-800">FV VMS</Link>
      </nav>

      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10 w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Visitor Check-In</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="mr-3">
                <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">{success}</p>
                <p className="text-sm mt-1">Redirecting to your digital badge...</p>
              </div>
            </div>
          </div>
        ) : visitor ? (
          <div>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">Visitor Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{visitor.firstName} {visitor.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{visitor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{visitor.phone}</p>
                </div>
                {/* <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{visitor.company || 'N/A'}</p>
                </div> */}
                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium">{visitor.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visit Date</p>
                  <p className="font-medium">{new Date(visitor.visitStartDate).toLocaleDateString()}-{new Date(visitor.visitEndDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${visitor.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                        visitor.status === 'checked-out' ? 'bg-gray-100 text-gray-800' :
                        visitor.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'}`}>
                      {visitor.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {visitor.status === 'approved' ? (
              <div className="flex justify-end">
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="bg-blue-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 disabled:bg-blue-300"
                >
                  {checkingIn ? 'Processing...' : 'Check In Now'}
                </button>
              </div>
            ) : visitor.status === 'checked-in' ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                You are already checked in.
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
                This visit is {visitor.status}.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No visitor information found.
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/"
            className="text-blue-900 hover:underline"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
