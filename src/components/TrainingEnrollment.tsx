'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { trainingAPI, Training, TrainingEnrollment as TrainingEnrollmentType } from '@/lib/api';
import { BookOpen, CheckCircle, AlertCircle, Award } from 'lucide-react';

interface TrainingEnrollmentProps {
  visitorId: string;
  onEnrollmentSuccess?: (enrollment: TrainingEnrollmentType) => void;
}

export default function TrainingEnrollment({ visitorId, onEnrollmentSuccess }: TrainingEnrollmentProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const trainingData = await trainingAPI.getAllTrainings();

      // Filter only if trainingData is an array
      const activeTrainings = Array.isArray(trainingData)
        ? trainingData.filter(training => training.isActive)
        : [];

      setTrainings(activeTrainings);

      if (activeTrainings.length > 0) {
        setSelectedTrainingId(activeTrainings[0]._id);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!token || !selectedTrainingId) return;

    setIsEnrolling(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const enrollment = await trainingAPI.enrollVisitor(visitorId, selectedTrainingId, token);
      setSuccessMessage('Visitor enrolled in training successfully');
      setTimeout(() => {setSuccessMessage(null)}, 4000)
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess(enrollment);
      }
    } catch (err) {
      console.error('Error enrolling visitor in training:', err);
      setError(err instanceof Error ? err.message : 'Failed to enroll visitor in training');
    } finally {
      setIsEnrolling(false);
    }
  };

  const getSelectedTraining = () => {
    return trainings.find(training => training._id === selectedTrainingId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading trainings...</span>
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No trainings available</h3>
        <p className="text-gray-500 mt-1">There are no active trainings available at this time.</p>
      </div>
    );
  }

  const selectedTraining = getSelectedTraining();

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
          Enroll Visitor in Training
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Success</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="trainingSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Training
          </label>
          <select
            id="trainingSelect"
            value={selectedTrainingId}
            onChange={(e) => setSelectedTrainingId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {trainings.map((training) => (
              <option key={training._id} value={training._id}>
                {training.title} - {training.type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {selectedTraining && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedTraining.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedTraining.description}</p>

            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">Type:</span>
              <span className="capitalize">{selectedTraining.type}</span>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">Questions:</span>
              <span>{selectedTraining?.questions?.length}</span>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium mr-2">Required Score:</span>
              <span>{selectedTraining.requiredScore}%</span>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleEnroll}
            disabled={isEnrolling || !selectedTrainingId}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnrolling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Enrolling...
              </>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" />
                Enroll Visitor
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 border-t border-blue-100">
        <div className="flex items-center text-sm text-blue-700">
          <Award className="h-5 w-5 mr-2" />
          <p>
            After enrollment, visitors will need to complete the training and pass the assessment to
            receive a certificate.
          </p>
        </div>
      </div>
    </div>
  );
}
