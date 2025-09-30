'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { notificationAPI, NotificationSettings as NotificationSettingsType } from '@/lib/api';
import { Bell, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    emailNotificationsEnabled: true,
    hostNotificationsEnabled: true,
    visitorNotificationsEnabled: true,
    notificationTypes: {
      'visitor-arrival': true,
      'visitor-departure': true,
      'visitor-registration': true,
      'visitor-cancelled': true,
      'check-in': true,
      'check-out': true,
      'registration': true,
      'cancelled': true,
      'welcome': true,
      'reset-password': true,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const notificationSettings = await notificationAPI.getNotificationSettings(token);
        setSettings(notificationSettings);
      } catch (err) {
        console.error('Error fetching notification settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notification settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const handleToggleMainSetting = (key: keyof Omit<NotificationSettingsType, 'notificationTypes'>) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleNotificationType = (type: string) => {
    setSettings((prev) => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: !prev.notificationTypes[type],
      },
    }));
  };

  const handleSaveSettings = async () => {
    if (!token) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await notificationAPI.updateNotificationSettings(settings, token);
      setSuccessMessage('Notification settings updated successfully');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" aria-hidden="true"></div>
        <span className="ml-2 text-gray-600">Loading notification settings...</span>
        <span className="sr-only">Loading notification settings, please wait</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
      <div className="flex items-center mb-6">
        <Bell className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
      </div>

      {error && (
        <div
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start"
          role="alert"
          aria-labelledby="error-heading"
        >
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" aria-hidden="true" />
          <div>
            <p id="error-heading" className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start"
          role="status"
          aria-labelledby="success-heading"
        >
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" aria-hidden="true" />
          <div>
            <p id="success-heading" className="font-medium">Success</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p id="email-notifications-label" className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <div className="flex items-center">
                <label htmlFor="email-notifications-toggle" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="email-notifications-toggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotificationsEnabled}
                    onChange={() => handleToggleMainSetting('emailNotificationsEnabled')}
                    aria-labelledby="email-notifications-label"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="sr-only">
                    {settings.emailNotificationsEnabled ? 'Disable email notifications' : 'Enable email notifications'}
                  </span>
                </label>
                <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                  {settings.emailNotificationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p id="host-notifications-label" className="text-sm font-medium text-gray-900">Host Notifications</p>
                <p className="text-sm text-gray-500">Send notifications to hosts</p>
              </div>
              <div className="flex items-center">
                <label htmlFor="host-notifications-toggle" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="host-notifications-toggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.hostNotificationsEnabled}
                    onChange={() => handleToggleMainSetting('hostNotificationsEnabled')}
                    aria-labelledby="host-notifications-label"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="sr-only">
                    {settings.hostNotificationsEnabled ? 'Disable host notifications' : 'Enable host notifications'}
                  </span>
                </label>
                <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                  {settings.hostNotificationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p id="visitor-notifications-label" className="text-sm font-medium text-gray-900">Visitor Notifications</p>
                <p className="text-sm text-gray-500">Send notifications to visitors</p>
              </div>
              <div className="flex items-center">
                <label htmlFor="visitor-notifications-toggle" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="visitor-notifications-toggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.visitorNotificationsEnabled}
                    onChange={() => handleToggleMainSetting('visitorNotificationsEnabled')}
                    aria-labelledby="visitor-notifications-label"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="sr-only">
                    {settings.visitorNotificationsEnabled ? 'Disable visitor notifications' : 'Enable visitor notifications'}
                  </span>
                </label>
                <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                  {settings.visitorNotificationsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(settings.notificationTypes).map(([type, enabled]) => {
              const id = `notification-type-${type}`;
              const label = type.replace(/-/g, ' ');

              return (
                <div key={type} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p id={`${id}-label`} className="text-sm font-medium text-gray-900 capitalize">
                    {label}
                  </p>
                  <div className="flex items-center">
                    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
                      <input
                        id={id}
                        type="checkbox"
                        className="sr-only peer"
                        checked={enabled}
                        onChange={() => handleToggleNotificationType(type)}
                        aria-labelledby={`${id}-label`}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="sr-only">
                        {enabled ? `Disable ${label} notifications` : `Enable ${label} notifications`}
                      </span>
                    </label>
                    <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                      {enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center sm:justify-start">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-3 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-live="polite"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" aria-hidden="true"></div>
              <span>Saving...</span>
              <span className="sr-only">Saving notification settings, please wait</span>
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
