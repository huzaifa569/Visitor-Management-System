"use client";
import { useState } from 'react';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import AppBar from '@/components/AppBar';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div>
        <AppBar />
         <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-white px-4 py-16">
      <div className="max-w-3xl w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-10 sm:p-14 border border-blue-100">
        <h2 className="text-4xl sm:text-5xl font-bold text-center text-blue-800 mb-10 tracking-tight">Let&apos;s Talk</h2>

        {submitted && (
          <div className="mb-8 text-green-700 font-medium text-center bg-green-50 border border-green-300 px-4 py-3 rounded-xl">
            ✅ Thank you! We received your message.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Your Message</label>
            <textarea
              name="message"
              rows={6}
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <PaperPlaneIcon className="w-5 h-5" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
    </div>
   
  );
}
