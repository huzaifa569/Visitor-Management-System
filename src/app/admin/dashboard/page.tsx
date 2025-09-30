'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import VisitHistoryTable from '@/components/VisitHistoryTable';
import {
  Users, Calendar, Clock, BarChart2, ArrowUp, FileText, BookOpen
} from 'lucide-react';

import { analyticsAPI, newVisitorAPI, VisitorForm } from '@/lib/api';
import AnalyticsDashboard from '@/components/charts/AnalyticsDashboard';

export default function AdminDashboard() {

  const [visitorStats, setVisitorStats] = useState({
    total: 0,
    checkedIn: 0,
    checkedOut: 0,
    scheduled: 0,
    pending: 0,
    approved: 0,
  });
  const [filteredVisitors, setFilteredVisitors] = useState<VisitorForm[]>([]);
  const [filteredContractors, setFilteredcontractors] = useState<VisitorForm[]>([]);
  const [filteredScheduleVisit, setFilteredScheduleVisit] = useState([]);
  const [checkedOut, setCheckedOut] = useState<VisitorForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

  

  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      const visitorData: VisitorForm[] = await newVisitorAPI.getAll();
      const scheduleVisitData = await newVisitorAPI.getAllSchedule();
      const visitors = visitorData.filter(v => v.visitorCategory === "visitor")
      setFilteredVisitors(visitors);
      const contractors = visitorData.filter(v => v.visitorCategory === "contractor");

      const checkedout = visitorData.filter(v => v.status === "checked-out");
      setCheckedOut(checkedout);


      setFilteredcontractors(contractors);
      setFilteredScheduleVisit(scheduleVisitData);

      console.log(filteredVisitors);
      console.log(filteredScheduleVisit);

    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (token) {
      // fetchVisitorStats();
      fetchVisitors();
    }
  }, [token]);

  if (!user) return null;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user.firstName}. Here&apos;s an overview of your visitor management system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Visitors</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{isLoading ? '...' : filteredVisitors.length}</p>
          <p className="text-green-500 text-sm mt-2 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>12% from last month</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Contractors</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{isLoading ? '...' : filteredContractors.length}</p>
          <p className="text-green-500 text-sm mt-2 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>12% from last month</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Scheduled</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{isLoading ? '...' : filteredScheduleVisit.length}</p>
          <p className="text-gray-500 text-sm mt-2">Upcoming visits</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Checked Out</h3>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{isLoading ? '...' : checkedOut.length}</p>
          <p className="text-gray-500 text-sm mt-2">Completed visits</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/visitors" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Manage Visitors</h3>
          </div>
          <p className="text-gray-600">View, edit, and manage all visitor records and check-ins.</p>
        </Link>

        <Link href="/admin/documents" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Document Management</h3>
          </div>
          <p className="text-gray-600">Upload and manage visitor documents and certifications.</p>
        </Link>

        <Link href="/admin/training" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Training</h3>
          </div>
          <p className="text-gray-600">Manage training modules and visitor enrollments.</p>
        </Link>

        <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          </div>
          <p className="text-gray-600">Manage system users, roles, and permissions.</p>
        </Link>
      </div>

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Real-time analytics and reports for visitors and access control</p>
          </div>
          <Link
            href="/admin/analytics"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Full Analytics
          </Link>
        </div>

        <AnalyticsDashboard refreshInterval={300000} />
      </div>

      {/* Visit History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Visit History</h2>
          <p className="text-gray-600 mt-1">View recent visitor activity</p>
        </div>

        <div className="p-2 sm:p-4 lg:p-6">
          <VisitHistoryTable />
        </div>
      </div>
    </>
  );
}
