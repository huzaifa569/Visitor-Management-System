'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import AppBar from '@/components/AppBar';

export default function ResetPassword() {
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Call the forgot password API
      const response = await authAPI.forgotPassword(email);

      // Show success message and move to next step
      setSuccessMessage(response.message || 'Reset instructions sent to your email');
      setStep('verify');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('User not found')) {
          setError('No account found with this email address');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // The backend doesn't have a separate verification step
    // The reset token is sent directly via email and used in the reset step
    // We'll just validate that the user entered something and proceed

    if (!resetToken || resetToken.trim() === '') {
      setError('Please enter the reset token from your email');
      setIsLoading(false);
      return;
    }

    // Add a basic format validation for the token
    // Typically, reset tokens are long strings with specific formats
    if (resetToken.length < 10) {
      setError('The reset token appears to be invalid. Please check your email and try again.');
      setIsLoading(false);
      return;
    }

    setSuccessMessage('Token accepted. Please set your new password.');
    setStep('reset');
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password requirements as per backend validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters and contain at least one letter and one number');
      setIsLoading(false);
      return;
    }

    try {
      // Call the reset password API
      await authAPI.resetPassword(resetToken, password);

      // Show success message and move to success step
      setSuccessMessage('Password reset successfully');
      setStep('success');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid or expired reset token')) {
          setError('The reset token is invalid or has expired. Please request a new one.');
        } else if (err.message.includes('Password must')) {
          setError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-100">
      <AppBar showAuthButtons={false} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/login" className="inline-flex items-center text-blue-900 hover:text-blue-700 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Login
        </Link>

        <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-3xl overflow-hidden">
          {/* Left form section */}
          <div className="md:w-1/2 p-8 md:p-12">
            {step === 'request' && (
              <>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Reset Your Password</h2>
                <p className="text-gray-600 mb-8">Enter your email address and we'll send you a code to reset your password.</p>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 animate-fadeIn">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 animate-fadeIn">
                    <p className="font-medium">Success</p>
                    <p className="text-sm">{successMessage}</p>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors"
                        placeholder="your.email@example.com"
                        autoComplete="email"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter the email address associated with your account</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-300 shadow-sm hover:shadow"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              </>
            )}

            {step === 'verify' && (
              <>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Enter Reset Token</h2>
                <p className="text-gray-600 mb-8">We've sent a password reset link to <span className="font-medium">{email}</span>. Please check your email and enter the reset token from the email below.</p>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 animate-fadeIn">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 animate-fadeIn">
                    <p className="font-medium">Success</p>
                    <p className="text-sm">{successMessage}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                    <input
                      id="code"
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center text-lg tracking-widest transition-colors"
                      placeholder="Enter reset token"
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1">The token is case-sensitive and should be entered exactly as shown in the email</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-300 shadow-sm hover:shadow"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="text-center mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">Didn't receive the email?</p>
                    <button
                      type="button"
                      onClick={() => setStep('request')}
                      className="text-blue-700 hover:text-blue-900 text-sm font-medium transition-colors"
                    >
                      Try again with a different email
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Please also check your spam or junk folder. The email should arrive within a few minutes.
                    </p>
                  </div>
                </form>
              </>
            )}

            {step === 'reset' && (
              <>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Create New Password</h2>
                <p className="text-gray-600 mb-8">Please enter your new password below.</p>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 animate-fadeIn">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 animate-fadeIn">
                    <p className="font-medium">Success</p>
                    <p className="text-sm">{successMessage}</p>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors"
                        placeholder="••••••••"
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="text-gray-500">Password requirements:</p>
                      <ul className="list-disc pl-5 text-gray-500 space-y-1 mt-1">
                        <li className={password.length >= 8 ? "text-green-600" : ""}>At least 8 characters long</li>
                        <li className={/[A-Za-z]/.test(password) ? "text-green-600" : ""}>At least one letter</li>
                        <li className={/\d/.test(password) ? "text-green-600" : ""}>At least one number</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors ${
                          confirmPassword && password !== confirmPassword
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || (password !== confirmPassword) || password.length < 8}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-300 shadow-sm hover:shadow"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Password Reset Successful</h2>
                <p className="text-gray-600 mb-8">Your password has been reset successfully. You can now log in with your new password.</p>
                <div className="flex flex-col items-center space-y-4">
                  <Link
                    href="/login"
                    className="inline-block bg-blue-900 text-white py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors shadow-sm hover:shadow"
                  >
                    Go to Login
                  </Link>
                  <Link
                    href="/"
                    className="inline-block text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right image section */}
          <div className="hidden md:block md:w-1/2 relative bg-blue-900">
            <Image
              src="/login-image.jpg"
              alt="Reset Password Visual"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70 flex items-center justify-center">
              <div className="text-white text-center p-8 max-w-md">
                <h3 className="text-3xl font-bold mb-4">Account Recovery</h3>
                <p className="text-lg">Securely reset your password to regain access to your account and continue managing visitor check-ins.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
