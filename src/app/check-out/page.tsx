'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { newVisitorAPI, VisitorForm } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import {
  User,
  Mail,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  LogOut,
  QrCode
} from 'lucide-react';
import AppBar from '@/components/AppBar';
import QRCodeScanner from '@/components/QRCodeScanner';

export default function CheckOut() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<VisitorForm[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const { token } = useAuth();
  // const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
  };

  const searchVisitor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchEmail) {
      setError('Please enter an email address');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuccess(null);
    // setSearchResults([]);

    try {
      const visitors = await newVisitorAPI.searchByEmail(searchEmail);
      
      // Filter for only checked-in visitors
      const checkedInVisitors = visitors;

      if (!checkedInVisitors) {
        setError('No checked-in visitors found with this email address');
     
      } else {
        setSearchResults([checkedInVisitors]);
      }
    } catch (err) {
      console.error('Error searching for visitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to search for visitor');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    setCheckingOut(visitorId);
    setError(null);
    setSuccess(null);

    try {
      await newVisitorAPI.checkOutVisitor(visitorId, token || '');

      // Update the search results to reflect the change
      setSearchResults(prev =>
        prev.filter(visitor => visitor._id !== visitorId)
      );

      setSuccess('You have been checked out successfully. Thank you for your visit!');
    } catch (err) {
      console.error('Error checking out visitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to check out. Please try again or contact reception.');
    } finally {
      setCheckingOut(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />

      {/* QR Code Scanner */}
      {showScanner && token && (
        <QRCodeScanner
          token={token}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <LogOut className="h-6 w-6 text-blue-700" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Visitor Check-Out</h1>
            </div>
            <p className="text-gray-600 mb-6">
              Please enter your email address to find your visit and check out.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-start">
                <div className="bg-red-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-lg mb-1">Check-Out Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-lg mb-1">Check-Out Successful!</p>
                  <p className="text-green-700">{success}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/" className="bg-white border border-green-300 text-green-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors">
                      Return to Home
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Search Form */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                Find Your Visit
              </h2>

              <form onSubmit={searchVisitor} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={searchEmail}
                      onChange={handleSearchChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchEmail}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg disabled:bg-blue-300 transition-colors flex items-center justify-center whitespace-nowrap shadow-sm"
                  >
                    {isSearching ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Find My Visit
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 flex items-center justify-center">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="px-3 bg-white text-gray-500 text-sm">OR</span>
                <div className="border-t border-gray-200 w-full"></div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Scan QR Code
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-blue-50 px-5 py-3 border-b border-gray-200 flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <h5 className="font-medium text-blue-900">Found {searchResults.length} active {searchResults.length === 1 ? 'visit' : 'visits'}</h5>
                </div>
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((visitor) => (
                    <li key={visitor._id} className="p-5 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center mr-3 text-white shadow-sm">
                              <span className="font-medium">
                                {visitor.firstName?.charAt(0)}{visitor.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{visitor.firstName} {visitor.lastName}</p>
                              <p className="text-sm text-gray-500">{visitor.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 ml-13 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium mr-1">Check-in time:</span>
                              {visitor.createdAt
                                ? new Date(visitor.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Not recorded'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium mr-1">Host:</span> {visitor.hostEmployee || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCheckOut(visitor._id)}
                          disabled={checkingOut === visitor._id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm disabled:bg-blue-300"
                        >
                          {checkingOut === visitor._id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              Check Out
                            </>
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Side Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Check-Out Instructions</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Please check out before leaving the premises. This helps us maintain accurate records and ensure security.
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Enter the email address you used during check-in</li>
                  <li>Select your visit from the list</li>
                  <li>Click the &quot;Check Out&quot; button</li>
                  <li>Return your visitor badge to reception</li>
                </ol>
                <p className="text-sm bg-blue-50 p-3 rounded-lg mt-4">
                  If you have any issues checking out, please contact the reception desk for assistance.
                </p>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <Image
                src="/reception.jpeg"
                alt="Reception"
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
