'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { adminAPI, SystemSettings as SystemSettingsType } from '@/lib/api';
import { Settings, Save, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function SystemSettings() {
 const [settings, setSettings] = useState<SystemSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, [token]);

 const fetchSettings = async () => {
  if (!token) return;

  setIsLoading(true);
  setError(null);

  try {
    const systemSettings = await adminAPI.getSystemSettings(token);
    console.log(systemSettings);
  
    setSettings({
      emailNotificationsEnabled: systemSettings?.emailNotificationsEnabled ?? true,
      qrCodeExpiryHours: systemSettings?.qrCodeExpiryHours ?? 24,
      visitorPhotoRequired: systemSettings?.visitorPhotoRequired ?? false,
      trainingRequired: systemSettings?.trainingRequired ?? false,
      systemVersion: systemSettings?.systemVersion ?? '1.0.0',
    });
  } catch (err) {
    console.error('Error fetching system settings:', err);
    setError(err instanceof Error ? err.message : 'Failed to load system settings');
  } finally {
    setIsLoading(false);
  }
};


const handleToggleSetting = (
  key: keyof Omit<SystemSettingsType, 'qrCodeExpiryHours' | 'systemVersion'>
) => {
  setSettings((prev) => {
    if (!prev) return prev; // ⛔️ prevent toggle if settings not loaded
    return {
      ...prev,
      [key]: !prev[key],
    };
  });
};


const handleQrCodeExpiryChange = (value: number) => {
  setSettings((prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      qrCodeExpiryHours: value,
    };
  });
};


  const handleSaveSettings = async () => {
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await adminAPI.updateSystemSettings(token, settings);
      setSuccessMessage('System settings updated successfully');
      fetchSettings();
      console.log(settings);
      
    } catch (err) {
      console.error('Error saving system settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save system settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading system settings...</span>
      </div>
    );
  }

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
        <div className="flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Access Denied</p>
            <p>You need administrator privileges to access system settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
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

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Success</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Enable email notifications system-wide</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  placeholder='email notif'
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings?.emailNotificationsEnabled}
                  onChange={() => handleToggleSetting('emailNotificationsEnabled')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Visitor Photo Required</p>
                <p className="text-sm text-gray-500">Require visitors to upload a photo during registration</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  placeholder="checkbox"
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings?.visitorPhotoRequired}
                  onChange={() => handleToggleSetting('visitorPhotoRequired')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Training Required</p>
                <p className="text-sm text-gray-500">Require visitors to complete training before check-in</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  placeholder='checkbox'
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings?.trainingRequired}
                  onChange={() => handleToggleSetting('trainingRequired')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="qrCodeExpiry" className="block text-sm font-medium text-gray-900 mb-1">
                QR Code Expiry (Hours)
              </label>
              <div className="flex items-center">
                <input
                  id="qrCodeExpiry"
                  type="number"
                  min="1"
                  max="168"
                  value={settings?.qrCodeExpiryHours}
                  onChange={(e) => handleQrCodeExpiryChange(parseInt(e.target.value) || 24)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="ml-2 text-sm text-gray-500">hours</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                QR codes will expire after this many hours (1-168)
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium mr-2">System Version:</span>
              <span>{settings?.systemVersion}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
