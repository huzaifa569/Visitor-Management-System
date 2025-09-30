'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import SystemSettings from '@/components/SystemSettings';
import NotificationSettings from '@/components/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Shield, Users, Database } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('system');

  if (!user) {
    return null; // Layout will handle unauthorized access
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="mt-2 text-gray-600">
          Manage system settings, notifications, and other administrative functions.
        </p>
      </div>

        <Tabs defaultValue="system" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm rounded-lg border border-gray-200">
            <TabsTrigger value="system" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden lg:block">System</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden lg:block">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden lg:block">Security</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden lg:block">Users</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              <span className="hidden lg:block">Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                Security Settings
              </h2>
              <p className="text-gray-600">
                Security settings will be implemented in a future update. This will include password
                policies, two-factor authentication, and session management.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                User Management
              </h2>
              <p className="text-gray-600 mb-4">
                Manage system users, roles, and permissions. Create new users, edit existing ones, and control access to the system.
              </p>
              <div className="flex justify-end">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to User Management
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-5 w-5 text-blue-600 mr-2" />
                Data Management
              </h2>
              <p className="text-gray-600">
                Data management will be implemented in a future update. This will include data
                backup, restoration, and purging options.
              </p>
            </div>
          </TabsContent>
        </Tabs>
    </>
  );
}
