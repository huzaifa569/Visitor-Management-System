'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { analyticsAPI } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import AnalyticsDashboard from '@/components/charts/AnalyticsDashboard';

interface TrainingMetrics {
  totalTrainings: number;
  completedTrainings: number;
  failedTrainings: number;
  averageScore: number;
  trainingsByDay: {
    date: string;
    count: number;
  }[];
}

export default function AnalyticsPage() {
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, token } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
    }
  }, [user, token, router]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError('');

        const [trainingData] = await Promise.all([
          analyticsAPI.getTrainingMetrics(token),
        ]);

        setTrainingMetrics(trainingData as TrainingMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (!user || !token) {
    return null; // Will redirect
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/dashboard" className="flex items-center text-blue-900 hover:text-blue-700">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40 text-blue-600 font-medium">
          Loading analytics...
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6 text-center">
          {error}
        </div>
      ) : (
        <div>
          <AnalyticsDashboard />
          {trainingMetrics ? (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Trainings</p>
                  <p className="text-2xl font-bold">{trainingMetrics.totalTrainings}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">{trainingMetrics.completedTrainings}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Failed</p>
                  <p className="text-2xl font-bold">{trainingMetrics.failedTrainings}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className="text-2xl font-bold">{trainingMetrics.averageScore}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No training metrics available
            </div>
          )}
        </div>
      )}
    </>
  );
}
