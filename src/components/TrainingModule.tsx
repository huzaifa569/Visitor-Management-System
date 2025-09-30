'use client';

import { useState, useEffect } from 'react';
import { trainingAPI, TrainingSubmissionResponse, Training } from '@/lib/api';

interface TrainingModuleProps {
  visitorId: string;
  token: string;
  onComplete: (passed: boolean) => void;
  onClose: () => void;
}

export default function TrainingModule({ visitorId, token, onComplete, onClose }: TrainingModuleProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [currentTraining, setCurrentTraining] = useState<Training | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'failed' | 'not_available'>('not_started');
  const [score, setScore] = useState<number>(0);

  // Fetch trainings and training status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        try {
          // Fetch training status first
          const statusResponse = await trainingAPI.getTrainingStatus(visitorId, token);

          // Check if visitor has completed any training
          if (Array.isArray(statusResponse) && statusResponse.length > 0) {
            const completedTraining = statusResponse.find(completion => completion.passed);
            if (completedTraining) {
              setTrainingStatus('completed');
              setScore(completedTraining.score);
              return;
            }
          }
        } catch (statusError) {
          console.error('Error fetching training status:', statusError);
          // Continue to fetch trainings
        }

        try {
          // Fetch available trainings
          const trainingsResponse = await trainingAPI.getAllTrainings();

          if (Array.isArray(trainingsResponse) && trainingsResponse.length > 0) {
            setTrainings(trainingsResponse);
            setCurrentTraining(trainingsResponse[0]);
            // Initialize selected answers array with -1 (no selection) for each question
            setSelectedAnswers(Array(trainingsResponse[0].questions?.length).fill(-1));
            setTrainingStatus('in_progress');
          } else {
            // No trainings available
            setError('No training modules available');
            setTrainingStatus('not_available');
          }
        } catch (trainingsError) {
          console.error('Error fetching trainings:', trainingsError);
          setError('Failed to load training modules');
          setTrainingStatus('not_available');
        }
      } catch (err) {
        console.error('Error in training module:', err);
        setError(err instanceof Error ? err.message : 'Failed to load training');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [visitorId, token]);



  const handleAnswerSelection = (questionIndex: number, answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNextQuestion = () => {
    const totalQuestions = currentTraining?.questions?.length || 0;
    if (currentTraining && currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTraining = async () => {
    if (!currentTraining) return;

    // Check if all questions have been answered
    if (selectedAnswers.includes(-1)) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      try {
        // Try to submit to API
        const response: TrainingSubmissionResponse = await trainingAPI.submitTraining(
          visitorId,
          score,
        );

        setScore(response.score);
        setTrainingStatus(response.passed ? 'completed' : 'failed');
        onComplete(response.passed);
      } catch (apiError) {
        console.error('Error submitting training to API:', apiError);

        // Calculate score locally as fallback
        const questionsLength = currentTraining?.questions?.length || 1; // fallback to prevent divide-by-zero
        // Calculate score locally as fallback
        const correctAnswers = selectedAnswers.filter(
          (answer, index) => answer === currentTraining?.questions?.[index]?.answer
        ).length;

        const calculatedScore = Math.round((correctAnswers / questionsLength) * 100);
        const passed = calculatedScore >= (currentTraining.requiredScore || 70);

        setScore(calculatedScore);
        setTrainingStatus(passed ? 'completed' : 'failed');
        onComplete(passed);

        console.log('Calculated score locally:', calculatedScore, 'Passed:', passed);
      }
    } catch (err) {
      console.error('Error in submit training handler:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit training');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress percentage for quiz
  const progressPercentage = currentTraining?.questions?.length
    ? Math.round(((currentQuestionIndex + 1) / currentTraining.questions.length) * 100)
    : 0;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Safety Training</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : trainingStatus === 'completed' ? (
          <div className="text-center py-8">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              You have successfully completed the training!
              {score !== null && (
                <p className="mt-2">Your score: {score}%</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        ) : trainingStatus === 'failed' ? (
          <div className="text-center py-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              You did not pass the training.
              {score !== null && (
                <p className="mt-2">Your score: {score}%</p>
              )}
              <p className="mt-2">Please try again.</p>
            </div>
            <button
              onClick={() => {
                // Reset training
                setCurrentQuestionIndex(0);
                setSelectedAnswers(Array(currentTraining?.questions?.length || 0).fill(-1));
                setTrainingStatus('in_progress');
                setScore(0);
              }}
              className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : currentTraining ? (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{currentTraining.title}</h3>
              <p className="text-gray-600">{currentTraining.description}</p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestionIndex + 1} of {currentTraining.questions?.length}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  Required to pass: {currentTraining.requiredScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-900 h-2.5 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="text-lg font-medium mb-4">
                {currentTraining.questions?.[currentQuestionIndex]?.question}
              </h4>

              <div className="space-y-3">
                {currentTraining.questions?.[currentQuestionIndex]?.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center"
                  >
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestionIndex}`}
                      checked={selectedAnswers[currentQuestionIndex] === index}
                      onChange={() => handleAnswerSelection(currentQuestionIndex, index)}
                      className="h-4 w-4 text-blue-900 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className="ml-2 block text-gray-700"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>

              {currentTraining?.questions && currentQuestionIndex === currentTraining.questions.length - 1 ? (
                <button
                  onClick={handleSubmitTraining}
                  disabled={isSubmitting || selectedAnswers[currentQuestionIndex] === -1}
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              ) : (
                <button type="button"
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQuestionIndex] === -1}
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No training available at this time.</p>
            <button
              onClick={onClose}
              className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
