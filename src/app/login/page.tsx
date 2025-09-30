'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ email, password });
      router.push('/admin/dashboard'); // Redirect to dashboard after login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-purple-50 to-white">
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden max-w-5xl w-full">
          {/* Left form section */}
          <div className="md:w-1/2 p-6 sm:p-8 md:p-12">
           <Link href="/" className="inline-flex items-center text-blue-900 hover:text-blue-700 mb-4 sm:mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Back
                  </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1 sm:mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Please sign in to access your account</p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded mb-4 sm:mb-6">
                <p className="font-medium text-sm sm:text-base">Login Error</p>
                <p className="text-xs sm:text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <label className="flex items-center gap-2 text-gray-700 text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Remember Me</span>
                </label>
                <Link href="/reset-password" className="text-blue-700 hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 text-white rounded-lg py-2.5 sm:py-3 font-semibold hover:bg-blue-800 disabled:bg-blue-300 transition-colors text-sm sm:text-base mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 sm:mt-6">
              <p className="text-xs sm:text-sm text-gray-600">Don&apos;t have an account? <Link href="/signup" className="text-blue-700 hover:underline font-medium">Create Account</Link></p>
            </div>


          </div>

          {/* Right image section */}
          <div className="hidden md:block md:w-1/2 relative">
            <Image
              src="/login-image.jpg"
              alt="Login Visual"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 flex items-center justify-center">
              <div className="text-white text-center p-6 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Visitor Management System</h3>
                <p className="text-base sm:text-lg max-w-md">Streamline your visitor check-in process with our secure and efficient system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
