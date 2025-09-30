'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { adminAPI, User } from '@/lib/api';
import { Users, Search, AlertCircle, CheckCircle, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [userGroups, setUserGroups] = useState<Record<string, string[]>>({});

  const { token, user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, departmentFilter, statusFilter]);

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const userData = await adminAPI.getUsers(token);
      console.log(userData);

      setUsers(userData);

      // Fetch groups for each user
      const groupMap: Record<string, string[]> = {};
      for (const usr of userData) {
        try {
          const res = await adminAPI.getUserGroups(usr._id, token);
          groupMap[usr._id] = res.groups;
        } catch (groupErr) {
          console.error(`Failed to fetch groups for user ${usr._id}`, groupErr);
          groupMap[usr._id] = [];
        }
      }

      setUserGroups(groupMap);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user?.firstName?.toLowerCase().includes(query) ||
          user?.lastName?.toLowerCase().includes(query) ||
          user?.email?.toLowerCase().includes(query) ||
          user?.department?.toLowerCase().includes(query)
      );
    }
    if (roleFilter) {
      filtered = filtered.filter((user) => user?.role === roleFilter);
    }
    if (departmentFilter) {
      filtered = filtered.filter((user) => user?.department === departmentFilter);
    }
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((user) => user?.isActive === isActive);
    }
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token || !userId) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await adminAPI.deleteUser(userId, token);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setSuccessMessage('User deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const getDepartments = () => {
    const departments = new Set<string>();
    users?.forEach((user) => user?.department && departments.add(user.department));
    return Array.from(departments);
  };

  if (!user) return null;

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">View, edit, and manage system users.</p>
        </div>
        <Link
          href="/admin/users/add"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div><p className="font-medium">Error</p><p>{error}</p></div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div><p className="font-medium">Success</p><p>{successMessage}</p></div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="host">Host</option>
                <option value="security">Security</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>

              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="">All Departments</option>
                {getDepartments().map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const firstName = user?.firstName ?? 'Unknown';
                  const lastName = user?.lastName ?? '';
                  const email = user?.email ?? '';
                  const role = user?.role ?? 'unknown';
                  const department = user?.department ?? 'N/A';
                  const isActive = user?.isActive ?? false;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-800 font-medium">
                              {firstName.charAt(0)}{lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{firstName} {lastName}</div>
                            <div className="text-sm text-gray-500">{email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{department}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {userGroups[user._id]?.length > 0
                          ? userGroups[user._id].join(', ')
                          : <span className="italic text-gray-400">None</span>}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/users/${user?._id ?? ''}`} className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button type="button"
                            onClick={() => handleDeleteUser(user?._id ?? '')}
                            className="text-red-600 hover:text-red-900"
                          >
                            {<Trash2 className="h-5 w-5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
