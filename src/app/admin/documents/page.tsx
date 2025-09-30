'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import DocumentUploader from '@/components/DocumentUploader';
import EnhancedDocumentViewer from '@/components/EnhancedDocumentViewer';
import { newVisitorAPI, VisitorForm } from '@/lib/api';
import { FileText, Search, AlertCircle } from 'lucide-react';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorForm | null>(null);
  const [visitors, setVisitors] = useState<VisitorForm[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<VisitorForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentsUpdated, setDocumentsUpdated] = useState(0);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchVisitors();
  }, [token, documentsUpdated]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVisitors(visitors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = visitors.filter(
        (visitor) =>
          visitor.firstName.toLowerCase().includes(query) ||
          visitor.lastName.toLowerCase().includes(query) ||
          visitor.email.toLowerCase().includes(query) ||
          (visitor.company && visitor.company.toLowerCase().includes(query))
      );
      setFilteredVisitors(filtered);
    }
  }, [searchQuery, visitors]);

  const fetchVisitors = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const visitorData: VisitorForm[] = await newVisitorAPI.getAll();
      const contractorVisitor = visitorData.filter(v => v.visitorCategory === "contractor");
      setVisitors(contractorVisitor);
      setFilteredVisitors(contractorVisitor);
      if (contractorVisitor.length > 0) {
        const selected = contractorVisitor.find(v => v._id === selectedVisitor?._id) || contractorVisitor[0];
        setSelectedVisitor(selected);
      }
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visitors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentChange = () => {
    setDocumentsUpdated(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="mt-2 text-gray-600">
            Upload, view, and manage visitor documents.
          </p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                Visitors
              </h2>

              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading visitors...</span>
                </div>
              ) : filteredVisitors.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No visitors found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96 -mx-6 px-6">
                  <ul className="divide-y divide-gray-200">
                    {filteredVisitors.map((visitor) => (
                      <li key={visitor._id}>
                        <button
                          onClick={() => setSelectedVisitor(visitor)}
                          className={`w-full text-left px-4 py-3 rounded-md ${
                            selectedVisitor?._id === visitor._id
                              ? 'bg-blue-50 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            {visitor.firstName} {visitor.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{visitor.email}</div>
                          {visitor.company && (
                            <div className="text-xs text-gray-400 mt-1">{visitor.company}</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {selectedVisitor ? (
              <>
                <DocumentUploader
                  visitorId={selectedVisitor._id}
                  onUploadSuccess={handleDocumentChange}
                />
                <EnhancedDocumentViewer
                  documents={selectedVisitor.documents || []}
                />
              </>
            ) : (
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No visitor selected</h3>
                <p className="text-gray-500 mt-1">
                  Select a visitor from the list to view and manage their documents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
