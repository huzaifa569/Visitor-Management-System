'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { trainingAPI, Training } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { convertFileToBase64, uploadBase64File } from "../../../../utils"




export default function CreateTrainingPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false)
  const [bookUploadLoading, setBookUploadLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<Training>>({
    title: '',
    description: '',
    type: 'safety',
    content: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        answer: 0
      }
    ],
    videos: [{ name: '', url: '' }],
    books: [{ name: '', url: '' }],
    requiredScore: 70,
    isActive: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedQuestions = [...(prev.questions || [])];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => {
      const updatedQuestions = [...(prev.questions || [])];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: number) => {
    setFormData(prev => {
      const updatedQuestions = [...(prev.questions || [])];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer: value
      };
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          question: '',
          options: ['', '', '', ''],
          answer: 0
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => {
      const updatedQuestions = [...(prev.questions || [])];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('You must be logged in to create a training module');
      return;
    }

    // Validate form
    if (!formData.title || !formData.description || !formData.type || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate questions
    if (!formData.questions || formData.questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    for (const question of formData.questions || []) {
      if (!question.question) {
        setError('All questions must have content');
        return;
      }

      if (question.options.some(option => !option)) {
        setError('All options must have content');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a new training module
      await trainingAPI.createTraining(formData, token);

      setSuccess('Training module created successfully');

      // Redirect to the training management page after a short delay
      setTimeout(() => {
        router.push('/admin/training');
      }, 1500);
    } catch (err) {
      console.error('Error creating training module:', err);
      setError(err instanceof Error ? err.message : 'Failed to create training module');
    } finally {
      setIsSubmitting(false);
    }
  };

  const MAX_VIDEO_SIZE_MB = 100;
  const MAX_BOOK_SIZE_MB = 20;


  type UploadEvent =
    | React.ChangeEvent<HTMLInputElement>
    | React.DragEvent<HTMLDivElement>;


  const handleVideoUpload = async (index: number, e: UploadEvent) => {
    e.preventDefault();
    const file = "dataTransfer" in e ? e.dataTransfer.files?.[0] : e.target.files?.[0];

    if (!file) return alert("No video selected");

    const sanitizedFile = new File([file], file.name.replace(/\//g, '-'), { type: file.type });
    const fileSizeInMB = sanitizedFile.size / (1024 * 1024);

    if (fileSizeInMB > MAX_VIDEO_SIZE_MB) {
      alert("Video exceeds 100MB limit. Please upload a smaller file.");
      return;
    }

    try {
      setVideoUploadLoading(true);
      const base64 = await convertFileToBase64(sanitizedFile);
      const url = await uploadBase64File(base64, "video", setVideoUploadLoading);
      setVideoUploadLoading(false);

      if (url) {
        setFormData(prev => {
          const updated = [...(prev.videos || [])];
          updated[index] = { name: file.name, url: url };
          const newFormData = { ...prev, videos: updated };
          console.log("Updated videos inside setFormData:", newFormData.videos); // ✅ See new values
          return newFormData;
        });


        console.log("Video upload successful");
      } else {
        console.warn("Video upload failed: No URL returned");
      }
    } catch (err) {
      console.error("Video upload failed:", err);
      setVideoUploadLoading(false);
    }
  };


  const handleBookUpload = async (index: number, e: UploadEvent) => {
    e.preventDefault();
    const file = "dataTransfer" in e ? e.dataTransfer.files?.[0] : e.target.files?.[0];

    if (!file) return alert("No book file selected");

    const sanitizedFile = new File([file], file.name.replace(/\//g, '-'), { type: file.type });
    const fileSizeInMB = sanitizedFile.size / (1024 * 1024);

    if (fileSizeInMB > MAX_BOOK_SIZE_MB) {
      alert("Book file exceeds 20MB limit. Please upload a smaller file.");
      return;
    }

    try {
      setBookUploadLoading(true);
      const base64 = await convertFileToBase64(sanitizedFile);
      const url = await uploadBase64File(base64, "raw", setBookUploadLoading);
      setBookUploadLoading(false);

      if (url) {
        setFormData(prev => {
          const updated = [...(prev.books || [])];
          updated[index] = { name: file.name, url: url }; // ✅ Update both name and url
          return { ...prev, books: updated };
        });
        console.log(formData);

        console.log("Book upload successful");
      } else {
        console.warn("Book upload failed: No URL returned");
      }
    } catch (err) {
      console.error("Book upload failed:", err);
      setBookUploadLoading(false);
    }
  };


  type VideoField = 'name' | 'url';

  const handleVideoChange = (index: number, field: VideoField, value: string) => {
    setFormData(prev => {
      const updated = [...(prev.videos || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, videos: updated };
    });
  };

  const addVideo = () => {
    setFormData(prev => ({
      ...prev,
      videos: [...(prev.videos || []), { name: '', url: '' }]
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => {
      const updated = [...(prev.videos || [])];
      updated.splice(index, 1);
      return { ...prev, videos: updated };
    });
  };


  type BookField = 'name' | 'url';

  const handleBookChange = (index: number, field: BookField, value: string) => {
    setFormData(prev => {
      const updated = [...(prev.books || [])]; // ✅ fix: use books not videos
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, books: updated }; // ✅ fix: return books not videos
    });
  };


  const addBook = () => {
    setFormData(prev => ({
      ...prev,
      books: [...(prev.books || []), { name: '', url: '' }]
    }));
  };

  const removeBook = (index: number) => {
    setFormData(prev => {
      const updated = [...(prev.books || [])];
      updated.splice(index, 1);
      return { ...prev, books: updated };
    });
  };


  console.log(formData);
  



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center">
          <Link href="/admin/training" className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Training Module</h1>
            <p className="mt-2 text-gray-600">
              Create a new training module for visitors.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Success</p>
              <p>{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="safety">Safety</option>
                <option value="security">Security</option>
                <option value="procedure">Procedure</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="requiredScore" className="block text-sm font-medium text-gray-700 mb-1">
              Required Score (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="requiredScore"
              name="requiredScore"
              value={formData.requiredScore}
              onChange={handleChange}
              required
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            {formData.questions?.map((question, questionIndex) => (
              <div key={questionIndex} className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-md font-medium text-gray-900">Question {questionIndex + 1}</h4>
                  {formData.questions && formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {<Trash2 className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                    placeholder="Enter question"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2 mb-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        placeholder='tick answeer'
                        type="radio"
                        id={`q${questionIndex}-option${optionIndex}`}
                        name={`q${questionIndex}-correct`}
                        checked={question.answer === optionIndex}
                        onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Select the radio button next to the correct answer.</p>
              </div>
            ))}
          </div>

          {/* Video Upload */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Videos</h3>
              <button type="button" onClick={addVideo} className="text-blue-600 hover:underline">Add Video</button>
            </div>
            {(formData.videos || []).map((video, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  placeholder="Video Name"
                  value={video.name}
                  onChange={(e) => handleVideoChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md"
                />
                <div className="relative w-[80%] sm:w-full overflow-hidden">
                  <input
                    placeholder="Video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoUpload(index, e)}
                    className="mb-2 w-full text-xs file:text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
                  />
                </div>

                {videoUploadLoading && (
                  <p className="text-blue-600 text-sm">Uploading video...</p>
                )}
                {video.url && !videoUploadLoading && (
                  <p className="text-green-600 text-sm">Uploaded ✅</p>
                )}

                <button onClick={() => removeVideo(index)} className="text-red-600 text-sm hover:underline">Remove</button>
              </div>
            ))}
          </div>

          {/* Books Upload */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Books</h3>
              <button type="button" onClick={addBook} className="text-blue-600 hover:underline">Add Book</button>
            </div>
            {(formData.books || []).map((book, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  placeholder="Book Name"
                  value={book.name}
                  onChange={(e) => handleBookChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md"
                />
                <div className="relative w-[80%] sm:w-full overflow-hidden">
                  <input
                    placeholder='book'
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={videoUploadLoading} 
                    onChange={(e) => handleBookUpload(index, e)}
                    className="mb-2 w-full text-xs file:text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
                  />
                </div>
                {bookUploadLoading && (
                  <p className="text-blue-600 text-sm">Uploading book...</p>
                )}
                {book.url && !bookUploadLoading && (
                  <p className="text-green-600 text-sm">Uploaded ✅</p>
                )}

                <button onClick={() => removeBook(index)} className="text-red-600 text-sm hover:underline">Remove</button>
              </div>
            ))}
          </div>


          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (immediately available to visitors)
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/admin/training"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Creating...' : 'Create Training'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
