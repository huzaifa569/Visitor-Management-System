'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { siteAPI, Department, MeetingLocation, SiteSettings } from '@/lib/api';
import { Building, MapPin, Settings, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SiteSettingsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meetingLocations, setMeetingLocations] = useState<MeetingLocation[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'departments' | 'locations' | 'settings'>('departments');

  // Form states
  const [newDepartment, setNewDepartment] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const { user, token } = useAuth();

  useEffect(() => {
    if (token && (user?.role === 'admin' || user?.role === 'manager')) {
      fetchData();
    }
  }, [token, user,]);

  const fetchData = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [deptData, locationData] = await Promise.all([
        siteAPI.getAllDepartments(token),
        siteAPI.getAllMeetingLocations(token),
      ]);

      // Try to get site settings if we have sites available
      let settingsData = null;
      try {
        const sites = await siteAPI.getAllSites(token);
        if (sites && sites.length > 0) {
          settingsData = await siteAPI.getSiteSettings(sites[0]._id, token);
        }
      } catch (settingsError) {
        console.warn('Could not load site settings:', settingsError);
      }

      setDepartments(deptData);
      setMeetingLocations(locationData);
      setSiteSettings(settingsData);
    } catch (err) {
      console.error('Error fetching site data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load site data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!token || !newDepartment.trim()) return;

    try {
      const department = await siteAPI.createDepartment({ name: newDepartment.trim() }, token);
      setDepartments(prev => [...prev, department]);
      setNewDepartment('');
      setSuccessMessage('Department added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add department');
    }
  };

  const handleAddLocation = async () => {
    if (!token || !newLocation.trim()) return;

    try {
      const location = await siteAPI.createMeetingLocation({ name: newLocation.trim() }, token);
      setMeetingLocations(prev => [...prev, location]);
      setNewLocation('');
      setSuccessMessage('Meeting location added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add meeting location');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this department?')) return;

    try {
      await siteAPI.deleteDepartment(id, token);
      setDepartments(prev => prev.filter(dept => dept._id !== id));
      setSuccessMessage('Department deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this meeting location?')) return;

    try {
      await siteAPI.deleteMeetingLocation(id, token);
      setMeetingLocations(prev => prev.filter(loc => loc._id !== id));
      setSuccessMessage('Meeting location deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meeting location');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          <Link href="/admin/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Site Management</h1>
          <p className="mt-2 text-gray-600">
            Manage departments, meeting locations, and site settings
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Success</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('departments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Departments
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'locations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Meeting Locations
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Site Settings
            </button>
          </nav>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Department name"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddDepartment}
                      disabled={!newDepartment.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div key={dept._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="font-medium text-gray-900">{dept.name}</span>
                      <button
                        onClick={() => handleDeleteDepartment(dept._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {departments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No departments found. Add one above.</p>
                  )}
                </div>
              </div>
            )}

            {/* Meeting Locations Tab */}
            {activeTab === 'locations' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Meeting Locations</h2>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Location name"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddLocation}
                      disabled={!newLocation.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {meetingLocations.map((location) => (
                    <div key={location._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <span className="font-medium text-gray-900">{location.name}</span>
                      <button
                        onClick={() => handleDeleteLocation(location._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {meetingLocations.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No meeting locations found. Add one above.</p>
                  )}
                </div>
              </div>
            )}

            {/* Site Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Site Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Visitor Types</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={siteSettings?.visitorEnabled !== false}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          readOnly
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Regular Visitors</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={siteSettings?.contractorEnabled !== false}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          readOnly
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Contractors</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Main Notification Email</label>
                        <input
                          placeholder='email '
                          type="email"
                          value={siteSettings?.mainNotificationEmail || ''}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Additional Notification Emails</label>
                        <textarea
                          value={siteSettings?.additionalNotificationEmails?.join('\n') || ''}
                          rows={3}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="One email per line"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-gray-500">
                      Site settings configuration is currently read-only. Contact your system administrator to modify these settings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
