// Updated TrainingPage.tsx
'use client';

import AppBar from '@/components/AppBar';
import { useEffect, useState } from 'react';
import { trainingAPI, Training } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, Record<number, string>>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [signedBooks, setSignedBooks] = useState<string[]>([]);
  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({});
  const [completedBooks, setCompletedBooks] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await trainingAPI.getAllTrainings();
        const activeTraining = response.filter((res: Training) => res.isActive === true);
        setTrainings(activeTraining);
      } catch (error) {
        console.error('Failed to fetch training content:', error);
      }
    };
    fetchTrainings();
  }, []);

  const handleOptionChange = (trainingIndex: number, questionIndex: number, selectedOption: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [trainingIndex]: {
        ...prev[trainingIndex],
        [questionIndex]: selectedOption,
      },
    }));
  };

  const handleQuizSubmit = async (trainingIndex: number) => {
    const training = trainings[trainingIndex];

    if (training.videos?.length && !completedVideos[training._id]) {
      return alert('Please complete all videos before taking the quiz.');
    }

    if (training.books?.length && !training.books.every(b => completedBooks[`${training._id}-${b.name}`])) {
      return alert('Please sign all books before taking the quiz.');
    }

    setShowResults((prev) => ({ ...prev, [trainingIndex]: true }));

    const quizQuestions = training.questions || [];
    const selected = selectedAnswers[trainingIndex] || {};
    let correct = 0;

    quizQuestions.forEach((q, i) => {
      const selectedOption = selected[i];
      const correctOption = q.options[q.answer];
      if (selectedOption === correctOption) correct++;
    });

    const total = quizQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    setScores((prev) => ({ ...prev, [trainingIndex]: percentage }));

    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selected,
          score: percentage,
          trainingId: training._id,
        }),
      });
    } catch (error) {
      console.error('Failed to submit quiz results:', error);
    }
  };

  const handleVideoComplete = (trainingId: string) => {
    setCompletedVideos((prev) => ({ ...prev, [trainingId]: true }));
  };

  const handleBookRead = (trainingId: string, bookName: string) => {
    const key = `${trainingId}-${bookName}`;
    if (!signedBooks.includes(key)) {
      setSignedBooks([...signedBooks, key]);
      setCompletedBooks((prev) => ({ ...prev, [key]: true }));
    }
  };

  const passedAnyTraining = Object.values(scores).some(score => score >= 70);

  const handleRedoTraining = () => {
    setSelectedAnswers({});
    setShowResults({});
    setScores({});
    setCompletedVideos({});
    setSignedBooks([]);
    setCompletedBooks({});
  };

  const isTrainingUnlocked = (index: number) => {
    if (index === 0) return true;
    return scores[index - 1] >= 70;
  };

  const handleCompleteTraining = async () => {
    const contractorId = localStorage.getItem('contractorId');
    if (!contractorId) {
      alert('Missing contractor ID. Please re-check in.');
      return;
    }

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const averageScore = Math.round(totalScore / Object.values(scores).length);

    try {
      await trainingAPI.submitTraining(contractorId, averageScore);
      alert('✅ Training completed!');
      router.push("/");
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('❌ Failed to complete training.');
    }
  };

  return (
    <div>
      <AppBar />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center mb-8">Training Center</h1>

        {trainings.map((training, index) => (
          <div key={training._id} className="space-y-8">
            {!isTrainingUnlocked(index) ? (
              <div className="bg-yellow-100 border p-4 rounded">
                <p className="text-yellow-700">Complete the previous training to unlock this one.</p>
              </div>
            ) : (
              <>
                <section className="bg-white border rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4">{training.title} - Videos</h2>
                  {training.videos?.length ? training.videos.map((video, i) => (
                    <div key={i} className="mt-4">
                      <p>{video.name}</p>
                      <video
                        controls
                        className="w-full rounded-md h-40"
                        onEnded={() => handleVideoComplete(training._id)}
                      >
                        <source src={video.url} type="video/mp4" />
                      </video>
                    </div>
                  )) : <p>No videos available</p>}
                </section>

                <section className="bg-white border rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4">{training.title} - Books</h2>
                  {training.books?.length ? training.books.map((book, i) => (
                    <div key={i}>
                      <p className="font-medium">{book.name}</p>
                      <a href={book.url} target="_blank" className="text-blue-600">📖 Read</a>
                      <a href={book.url.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(book.name)}/`)} className="ml-4 text-green-600">📥 Download</a>
                      {!completedBooks[`${training._id}-${book.name}`] && (
                        <button onClick={() => handleBookRead(training._id, book.name)} className="ml-4 text-purple-600">✍️ Sign Book</button>
                      )}
                    </div>
                  )) : <p>No books available</p>}
                </section>

                <section className="bg-white border rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4">{training.title} - Quiz</h2>
                  {training.questions?.length ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleQuizSubmit(index); }}>
                      {training.questions.map((q, i) => (
                        <div key={i} className="mb-4">
                          <p>{i + 1}. {q.question}</p>
                          {q.options.map((opt, j) => (
                            <label key={j} className="block">
                              <input
                                type="radio"
                                name={`training-${index}-q-${i}`}
                                value={opt}
                                checked={selectedAnswers[index]?.[i] === opt}
                                onChange={() => handleOptionChange(index, i, opt)}
                              /> {opt}
                            </label>
                          ))}
                          {showResults[index] && (
                            <p className={selectedAnswers[index]?.[i] === q.options[q.answer] ? 'text-green-600' : 'text-red-600'}>
                              {selectedAnswers[index]?.[i] === q.options[q.answer] ? '✅ Correct' : `❌ Correct: ${q.options[q.answer]}`}
                            </p>
                          )}
                        </div>
                      ))}
                      <button
                        type="submit"
                        disabled={
                          Boolean(training.videos?.length && !completedVideos[training._id]) ||
                          Boolean(training.books?.length && !training.books.every((b) => completedBooks[`${training._id}-${b.name}`]))
                        }
                        className="px-6 py-2 rounded-full bg-green-600 text-white disabled:bg-gray-300"
                      >
                        Submit Quiz
                      </button>
                      {scores[index] !== undefined && <p className="mt-4">Score: {scores[index]}%</p>}
                    </form>
                  ) : <p>No quiz available</p>}
                </section>
              </>
            )}
          </div>
        ))}

        <div className="text-center mt-10">
          {passedAnyTraining ? (
            <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-full" onClick={handleCompleteTraining}>🎉 Finish</button>
          ) : (
            <button type="button" onClick={handleRedoTraining} className="bg-red-600 text-white px-6 py-2 rounded-full">🔁 Redo Training</button>
          )}
        </div>
      </div>
    </div>
  );
}
