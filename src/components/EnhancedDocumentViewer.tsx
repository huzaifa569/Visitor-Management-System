'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Download, FileArchive, FileSpreadsheet,
  FileImage, FileVideo, FileAudio, File
} from 'lucide-react';
import { Doc } from '@/lib/api';

interface EnhancedDocumentViewerProps {
  documents: Doc[];
}

const NEXT_PUBLIC_API_BASE_URL = 'https://backend-vms-1.onrender.com/api';

export default function EnhancedDocumentViewer({ documents }: EnhancedDocumentViewerProps) {
  const [filteredDocuments, setFilteredDocuments] = useState<Doc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let filtered = [...documents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(q)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    filtered.sort((a, b) => {
      let comp = 0;
      switch (sortBy) {
        case 'date':
          comp =
            new Date(a.uploadedAt ?? '').getTime() -
            new Date(b.uploadedAt ?? '').getTime();
          break;
        case 'name':
          comp = a.name.localeCompare(b.name);
          break;
        case 'type':
          comp = (a.type || '').localeCompare(b.type || '');
          break;
      }
      return sortDirection === 'asc' ? comp : -comp;
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, filterType, sortBy, sortDirection]);

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="text-red-600 h-5 w-5" />;
      case 'doc':
      case 'docx': return <FileText className="text-blue-600 h-5 w-5" />;
      case 'xls':
      case 'xlsx': return <FileSpreadsheet className="text-green-600 h-5 w-5" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FileImage className="text-purple-600 h-5 w-5" />;
      case 'mp4':
      case 'avi': return <FileVideo className="text-pink-600 h-5 w-5" />;
      case 'mp3':
      case 'wav': return <FileAudio className="text-yellow-600 h-5 w-5" />;
      case 'zip':
      case 'rar': return <FileArchive className="text-gray-600 h-5 w-5" />;
      default: return <File className="text-gray-600 h-5 w-5" />;
    }
  };

  const handleSortChange = (field: typeof sortBy) => {
    if (field === sortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleDownload = async (doc: Doc) => {
    try {
      const response = await fetch(doc.url, {
        mode: 'cors', // in case of cross-origin
      });

      if (!response.ok) throw new Error('File download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Download failed');
    }
  };

  const handleDelete = async (docName: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this document?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/admin/documents?name=${encodeURIComponent(docName)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete document');

      // Remove from state
      setFilteredDocuments(prev => prev.filter(doc => doc.name !== docName));
    } catch (error) {
      console.error(error);
      alert('Failed to delete document');
    }
  };


  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Documents</h2>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/2"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="fileType" className="text-sm font-medium text-gray-700">File Type</label>
          <select
            id="fileType"
            name="fileType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="spreadsheet">Spreadsheet</option>
          </select>
        </div>
      </div>

      {/* Scrollable table container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {['name', 'type', 'date'].map(col => (
                <th
                  key={col}
                  onClick={() => handleSortChange(col as any)}
                  className="px-4 py-2 text-left cursor-pointer whitespace-nowrap"
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                  {sortBy === col && ` ${sortDirection === 'asc' ? '↑' : '↓'}`}
                </th>
              ))}
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocuments.map((doc, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 flex items-center gap-2">
                  {getFileTypeIcon(doc.name)}
                  <span className="truncate max-w-[150px]">{doc.name}</span>
                </td>
                <td className="px-4 py-2 capitalize">{doc.type || 'N/A'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {doc.uploadedAt
                    ? new Date(doc.uploadedAt).toLocaleString()
                    : 'Unknown'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-green-600 hover:underline flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.name)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No docs fallback */}
      {filteredDocuments.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No documents found.</p>
      )}
    </div>

  );
}
