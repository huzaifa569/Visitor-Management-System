'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { newVisitorAPI, Doc } from '@/lib/api';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { convertFileToBase64, uploadBase64File } from '../utils'; // ensure you have this

interface DocumentUploaderProps {
  visitorId: string;
  onUploadSuccess?: (document: Doc) => void;
}

export default function DocumentUploader({ visitorId, onUploadSuccess }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'id' | 'nda' | 'training' | 'other'>('id');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const MAX_FILE_SIZE_MB = 5;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('You must be logged in to upload documents');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > MAX_FILE_SIZE_MB) {
      setError('File exceeds the 5MB size limit');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const base64 = await convertFileToBase64(file);
      const fullBase64 = `data:${file.type};base64,${base64}`;
      const url = await uploadBase64File(fullBase64, 'raw');

      if (!url) throw new Error('Cloud upload failed');

      const uploadedDocument: Doc = {
        name: file.name,
        url,
        type: documentType,
        uploadedAt: new Date().toISOString(),
      };

      // Save to backend
      await newVisitorAPI.addDocument(visitorId, uploadedDocument);

      setSuccessMessage(`Document "${file.name}" uploaded successfully`);
      setFile(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadSuccess) onUploadSuccess(uploadedDocument);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Success</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="id">Identification</option>
            <option value="nda">Non-Disclosure Agreement</option>
            <option value="training">Training Certificate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the document"
          />
        </div>

        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            File
          </label>
          {file ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center overflow-hidden">
                <File className="h-5 w-5 flex-shrink-0 text-blue-500 mr-2" />
                <span className="text-sm text-gray-900 truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="text-gray-500 hover:text-gray-700 mt-2 sm:mt-0 self-end sm:self-auto"
              >
               { <X className="h-5 w-5" /> }
              </button>
            </div>
          ) : (
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setFile(e.dataTransfer.files[0]);
                  setError(null);
                }
              }}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex flex-col sm:flex-row items-center text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="pl-1 mt-1 sm:mt-0">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 5MB</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center sm:justify-end">
          <button
            type="submit"
            disabled={isUploading || !file}
            className="inline-flex items-center px-6 py-3 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
