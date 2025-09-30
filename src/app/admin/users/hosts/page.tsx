'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { adminAPI, employeeAPI, User } from '@/lib/api';
import { Users, Search, AlertCircle, CheckCircle, XCircle, Edit, Trash2, Plus, Filter, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface Host {
  id: string;
  name: string;
  email: string;
  department: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export default function HostManagementPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [departments, setDepartments] = useState<string[]>([]);
  
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchHosts();
    }
  }, [token]);

  useEffect(() => {
    if (searchQuery.trim() === '' && departmentFilter === '') {
      setFilteredHosts(hosts);
    } else {
      let filtered = [...hosts];
      
      // Apply search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (host) =>
            host.name.toLowerCase().includes(query) ||
            host.email.toLowerCase().includes(query) ||
            (host.department && host.department.toLowerCase().includes(query))
        );
      }
      
      // Apply department filter
      if (departmentFilter !== '') {
        filtered = filtered.filter(host => host.department === departmentFilter);
      }
      
      setFilteredHosts(filtered);
    }
  }, [searchQuery, departmentFilter, hosts]);

  const fetchHosts = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use the employeeAPI to get all hosts
      const hostData = await employeeAPI.getEmployees(token);
      
      // Extract unique departments for filtering
      const deptSet = new Set<string>();
      hostData.forEach(host => {
        if (host.department) {
          deptSet.add(host.department);
        }
      });
      
      setDepartments(Array.from(deptSet).sort());
      setHosts(hostData);
      setFilteredHosts(hostData);
    } catch (err) {
      console.error('Error fetching hosts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hosts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Layout will handle unauthorized access
  }

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Management</h1>
          <p className="mt-2 text-gray-600">
            Manage employees who can host visitors
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/users/add?role=host"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add New Host
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">All Hosts</h2>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search hosts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search hosts"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="pl-10 w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Filter by department"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading hosts...</p>
          </div>
        ) : filteredHosts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery || departmentFilter ? 'No hosts match your search criteria' : 'No hosts found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHosts.map((host) => (
                  <tr key={host.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                          {host.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{host.name}</div>
                          <div className="text-sm text-gray-500">{host.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{host.department || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {host.email}
                        </div>
                        {host.phoneNumber && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {host.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        host.isActive === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {host.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/users/edit/${host.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-4 w-4 inline" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
