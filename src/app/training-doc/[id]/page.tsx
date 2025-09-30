'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Training, trainingAPI } from '@/lib/api';
import AppBar from '@/components/AppBar';

export default function TrainingDetailPage() {
  const router = useRouter();
  const [training, setTraining] = useState<Training>();
  const [allTrainings, setAllTrainings] = useState<Training[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [readBooks, setReadBooks] = useState<string[]>([]);

  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const contractorId = localStorage.getItem('contractorId');
    if (!contractorId) {
      alert('No contractor ID found. Please start from the check-in page.');
      router.push('/check-in');
      return;
    }

    setContractorId(contractorId);

    const fetchData = async () => {
      try {
        const trainingData: Training = await trainingAPI.getTrainingById(id);
        const trainings: Training[] = await trainingAPI.getAllTrainings();
        setTraining(trainingData);
        setAllTrainings(trainings.filter(t => t.isActive));

        const progress = await trainingAPI.getCompletedTrainingsByVisitor(contractorId);
        const isDone = progress.some((p: any) => p.trainingId === id);
        setIsCompleted(isDone);
      } catch (err) {
        console.error('Error loading training data:', err);
        alert('Error loading training');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleMarkComplete = async (optionalScore?: number) => {
    if (!contractorId || !training?._id) return;
    try {
      await trainingAPI.markTrainingCompleted(contractorId, training._id, training.title, optionalScore);
      setIsCompleted(true);

      const currentIndex = allTrainings.findIndex(t => t._id === id);
      const next = allTrainings[currentIndex + 1];

      if (next) {
        router.push(`/training-doc/${next._id}`);
      } else {
        try {
          await trainingAPI.submitTraining(contractorId, optionalScore || 0);
        } catch (error) {
          console.error('Error completing training:', error);
          alert('Failed to submit as complete');
        }

        alert('✅ All trainings completed!');
        router.push('/training-doc/success');
      }
    } catch (error) {
      console.error('Error completing training:', error);
      alert('Failed to mark as complete');
    }
  };

  const handleQuizChange = (questionIndex: number, selectedOption: number) => {
    const updatedAnswers = [...quizAnswers];
    updatedAnswers[questionIndex] = selectedOption;
    setQuizAnswers(updatedAnswers);
  };

  const handleQuizSubmit = () => {
    if (!training?.questions || !contractorId) return;

    let correct = 0;
    training.questions.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });

    const percentage = Math.round((correct / training.questions.length) * 100);
    setScore(percentage);
    localStorage.setItem('lastScore', percentage.toString());

    if (percentage >= training.requiredScore) {
      handleMarkComplete(percentage);
    } else {
      alert(`You scored ${percentage}%. You need at least ${training.requiredScore}% to pass. Try again.`);
    }
  };

  if (loading || !training) return <p className="text-center mt-10">Loading training...</p>;

  return (
    <>
      <AppBar />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">{training.title}</h1>
        <p className="mb-6 text-gray-700">{training.description}</p>

        {/* VIDEOS */}
        <section className="bg-white border rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">{training.title} - Videos</h2>
          {training.videos?.length ? training.videos.map((video, i) => (
            <div key={i} className="mb-4">
              <h3 className="text-md font-semibold mb-1">{video.name}</h3>
              <video controls className="w-full rounded shadow">
                <source src={video.url} type="video/mp4" />
              </video>
            </div>
          )) : <p>No videos available</p>}
        </section>

        {/* BOOKS */}
        <section className="bg-white border rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">{training.title} - Books</h2>
          {training.books?.length ? training.books.map((book, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-md font-semibold mb-2">{book.name}</h3>

              {/* Preview inline */}
              {book.url.endsWith('.pdf') ? (
                <iframe
                  src={book.url}
                  className="w-full h-96 border rounded"
                  title={book.name}
                />
              ) : (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(book.url)}&embedded=true`}
                  className="w-full h-96 border rounded"
                  title={book.name}
                />
              )}

              {/* Sign Book */}
              {!readBooks.includes(book.name) && (
                <button
                  onClick={() => setReadBooks([...readBooks, book.name])}
                  className="mt-2 inline-block text-purple-600 underline"
                >
                  ✍️ Sign Book
                </button>
              )}

              {readBooks.includes(book.name) && (
                <p className="text-green-600 text-sm mt-2">✔ Book Signed</p>
              )}
            </div>
          )) : <p>No books available</p>}
        </section>

        {/* QUIZ */}
        <section className="bg-white border rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">{training.title} - Quiz</h2>
          {training.questions?.length ? (
            <div>
              {training.questions.map((q, index) => (
                <div key={index} className="mb-6">
                  <p className="font-medium">{index + 1}. {q.question}</p>
                  <div className="space-y-1 mt-2">
                    {q.options.map((option, i) => (
                      <label key={i} className="block text-sm text-gray-700">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={i}
                          checked={quizAnswers[index] === i}
                          onChange={() => handleQuizChange(index, i)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
                onClick={handleQuizSubmit}
              >
                Submit Quiz
              </button>
            </div>
          ) : (
            <p className="text-gray-500 italic">No quiz available</p>
          )}
          {score !== null && (
            <p className={`mt-4 font-semibold ${score >= training.requiredScore ? 'text-green-600' : 'text-red-600'}`}>
              Score: {score}%
            </p>
          )}
        </section>

        {/* Mark complete */}
        {!isCompleted && training.type !== 'quiz' && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-8"
            onClick={() => handleMarkComplete()}
          >
            ✅ Mark as Completed & Continue
          </button>
        )}

        {isCompleted && (
          <p className="text-green-700 font-semibold text-center mt-6">✔ Training Completed</p>
        )}
      </div>
    </>
  );
}
