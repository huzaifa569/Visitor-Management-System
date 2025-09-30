'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trainingAPI, Training } from '@/lib/api';
import AppBar from '@/components/AppBar';

export default function TrainingSuccessPage() {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const [completedCourses, setCompletedCourses] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
//   const [contractorId, setContractorId] = useState<string | null>(null);

  useEffect(() => {
    const contractorId = localStorage.getItem('contractorId');
    if (!contractorId) {
      alert('No contractor ID found. Please start from the check-in page.');
      router.push('/check-in');
      return;
    }

    // setContractorId(contractorId);

    const fetchCompletedTrainings = async () => {
      try {
        const progress = await trainingAPI.getCompletedTrainingsByVisitor(contractorId);
        setCompletedCourses(progress);

        // If score was saved in localStorage, load it
        const savedScore = localStorage.getItem('lastScore');
        if (savedScore) setScore(parseInt(savedScore));
      } catch (err) {
        console.error('Failed to fetch completed trainings:', err);
        alert('Error loading completed trainings');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedTrainings();
  }, [router]);

  const handleGoHome = () => {
    localStorage.removeItem('lastScore');
    router.push('/');
  };

  if (loading) return <p className="text-center mt-10">Loading results...</p>;

  return (
    <>
      <AppBar />
      <div className='flex items-center justify-center w-full h-[70vh]'>
        <div className="max-w-3xl mx-auto p-6 mt-8 bg-white shadow-md rounded-lg w-[80%]">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-700 mb-4">🎉 Training Completed!</h1>

        {score !== null && (
          <p className="text-base md:text-lg text-gray-800 mb-6">
            <strong>Your Score:</strong> <span className="text-blue-600">{score}%</span>
          </p>
        )}

        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2">✅ Courses You Have Completed:</h2>
        <ul className="list-disc list-inside md:my-6 mb-6 mt-2 text-gray-700">
          {completedCourses.length > 0 ? (
            completedCourses.map((course, index) => (
              <li key={index} className='text-sm md:text-base'>{course.title}</li>
            ))
          ) : (
            <li>No courses found.</li>
          )}
        </ul>

        <button
          onClick={handleGoHome}
          className="bg-blue-600 text-white px-6 md:px-6 py-2 rounded hover:bg-blue-700 transition text-sm md:text-base"
        >
          🔙 Back to Home
        </button>
      </div>
      </div>
      
    </>
  );
}
