'use client';

import { useState, useEffect, useCallback } from 'react';
import { trainingAPI, TrainingSubmissionResponse, Training } from '@/lib/api';
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  X,
  Info,
  HelpCircle,
  Clock
} from 'lucide-react';



interface EnhancedTrainingModuleProps {
  visitorId: string;
  token: string;
  onComplete: (passed: boolean) => void;
  onClose: () => void;
}

export default function EnhancedTrainingModule({
  visitorId,
  token,
  onComplete,
  onClose
}: EnhancedTrainingModuleProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [currentTraining, setCurrentTraining] = useState<Training | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'content' | 'quiz' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Timer for tracking time spent on training
  useEffect(() => {
    if (currentStep === 'content' || currentStep === 'quiz') {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  // Format time spent in MM:SS format
  const formatTimeSpent = useCallback(() => {
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeSpent]);

  // Fetch training data
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !visitorId) return;

      try {
        setIsLoading(true);
        setError(null);

        // First check if visitor has any required trainings
        try {
          const trainingStatus = await trainingAPI.getTrainingStatus(visitorId, token);

          // If visitor has already completed all required trainings, show a message
          if (Array.isArray(trainingStatus) && trainingStatus.length > 0 && trainingStatus.every((completion: any) => completion.passed)) {
            // All trainings completed, but we'll still show available trainings
            console.log('All required trainings completed');
          }
        } catch (statusError) {
          console.error('Error checking training status:', statusError);
        }

        try {
          // Fetch available trainings
          const trainingsResponse = await trainingAPI.getAllTrainings();

          if (Array.isArray(trainingsResponse) && trainingsResponse.length > 0) {
            setTrainings(trainingsResponse);
            setCurrentTraining(trainingsResponse[0]);
            // Initialize selected answers array with -1 (no selection) for each question
            setSelectedAnswers(Array(trainingsResponse[0]?.questions?.length).fill(-1));
          } else {
            // No trainings available
            setError('No training modules available');
          }
        } catch (trainingsError) {
          console.error('Error fetching trainings:', trainingsError);
          setError('Failed to load training modules');
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



  // Handle answer selection
  const handleAnswerSelection = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  // Navigate to next question
  const goToNextQuestion = () => {
     const totalQuestions = currentTraining?.questions?.length || 0;

  if (currentTraining && currentQuestionIndex < totalQuestions - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setShowHint(false);
    } else {
      // If this is the last question, show results
      handleSubmitQuiz();
    }
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHint(false);
    }
  };

  // Handle quiz submission
  const handleSubmitQuiz = async () => {
    if (!currentTraining || !token || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      try {
        // Try to submit to API
        const response: TrainingSubmissionResponse = await trainingAPI.submitTraining(
          visitorId,
          score
        );

        setScore(response.score);
        setPassed(response.passed);
        setCurrentStep('results');
      } catch (apiError) {
        console.error('Error submitting training to API:', apiError);

        // Calculate score locally as fallback
        const questionsLength = currentTraining?.questions?.length || 1; // fallback to prevent divide-by-zero

        const correctAnswers = selectedAnswers.filter(
          (answer, index) => answer === currentTraining?.questions?.[index]?.answer
        ).length;

        const calculatedScore = Math.round((correctAnswers / questionsLength) * 100);

        const hasPassed = calculatedScore >= (currentTraining.requiredScore || 70);

        setScore(calculatedScore);
        setPassed(hasPassed);
        setCurrentStep('results');

        console.log('Calculated score locally:', calculatedScore, 'Passed:', hasPassed);
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



  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-700" />
              Loading Training
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading training content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-900 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-red-700" />
              Error
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">Failed to load training</p>
            <p>{error}</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTraining) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-700" />
              No Training Available
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Training Modules Available</h3>
            <p className="text-gray-600 mb-6">There are currently no training modules available for you to complete.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-900 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-blue-700" />
            {currentTraining.title}
          </h2>
          <div className="flex items-center">
            {(currentStep === 'content' || currentStep === 'quiz') && (
              <div className="mr-4 flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTimeSpent()}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress bar for quiz */}
        {currentStep === 'quiz' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestionIndex + 1} of {currentTraining.questions?.length}</span>
              <span>{progressPercentage}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Introduction Step */}
        {currentStep === 'intro' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Welcome to {currentTraining.title}</h3>
              <p className="text-blue-800 mb-4">{currentTraining.description}</p>
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-700 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  This training will take approximately 5-10 minutes to complete. You will need to score at least {currentTraining.requiredScore}% on the quiz to pass.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What You&apos;ll Learn:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Essential safety procedures and protocols</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Emergency response guidelines</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Important contact information</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Visitor responsibilities while on premises</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('content')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Begin Training
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Step */}
        {currentStep === 'content' && (
          <div className="space-y-6">
            <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: currentTraining.content }}></div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setCurrentStep('intro')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep('quiz')}
                className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Take Quiz
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Quiz Step */}
        {currentStep === 'quiz' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {currentTraining.questions?.[currentQuestionIndex]?.question ?? "Question not available"}
              </h3>

              <div className="space-y-3 mb-6">
                {currentTraining.questions?.[currentQuestionIndex]?.options?.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedAnswers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    onClick={() => handleAnswerSelection(currentQuestionIndex, index)}
                  >
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${selectedAnswers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                      }`}>
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <label
                      htmlFor={`option-${index}`}
                      className="block text-gray-700 flex-grow cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>

              {showHint && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <HelpCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        Hint: Review the section on {
                          currentQuestionIndex === 0 ? 'emergency procedures' :
                            currentQuestionIndex === 1 ? 'fire safety equipment' :
                              currentQuestionIndex === 2 ? 'visitor identification' :
                                currentQuestionIndex === 3 ? 'visitor protocols' :
                                  'emergency contacts'
                        }.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <div>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${currentQuestionIndex === 0
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Previous
                  </button>
                  <button
                    onClick={goToNextQuestion}
                    disabled={selectedAnswers[currentQuestionIndex] === -1}
                    className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${selectedAnswers[currentQuestionIndex] === -1
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                  >
                    {currentTraining?.questions && currentQuestionIndex < currentTraining.questions.length
                      - 1 ? (
                      <>
                        Next
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      'Submit Quiz'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && score !== null && passed !== null && (
          <div className="space-y-6">
            {passed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h3>
                <p className="text-green-700 mb-4">You passed the training with a score of {score}%.</p>
                <p className="text-green-600">You have successfully completed the {currentTraining.title}.</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-2">Training Not Passed</h3>
                <p className="text-red-700 mb-4">Your score: {score}%. Required: {currentTraining.requiredScore}%.</p>
                <p className="text-red-600">Please review the training material and try again.</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              {!passed && (
                <button
                  onClick={() => {
                    setCurrentStep('intro');
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers(Array(currentTraining.questions?.length).fill(-1));
                    setScore(0);
                    setPassed(null);
                    setTimeSpent(0);
                  }}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Retry Training
                </button>
              )}
              <button
                onClick={() => {
                  onComplete(passed);
                }}
                className={`inline-flex items-center px-6 py-3 border text-base font-medium rounded-md shadow-sm ${passed
                  ? 'border-transparent text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  }`}
              >
                {passed ? 'Complete Training' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
