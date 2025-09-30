'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

type Group = {
  _id: string;
  name: string;
  description?: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  groups: string[];
};

export default function GroupListWithMembers() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<string, User[]>>({});

  useEffect(() => {
    const fetchGroupsAndMembers = async () => {
      if (!token) return;
      try {
        const groupsData = (await adminAPI.fetchGroups(token)).sort((a, b) => a.name.localeCompare(b.name));

        setGroups(groupsData);

        const membersMap: Record<string, User[]> = {};

        for (const group of groupsData) {
          const users = await adminAPI.getGroupMembers(group.name, token);

          membersMap[group.name] = users;
        }

        setGroupMembers(membersMap);
      } catch (err) {
        console.error('Failed to fetch groups or members', err);
      }
    };


    fetchGroupsAndMembers();
  }, [token]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Groups and Members</h2>

      {groups.map(group => (
        <div key={group._id} className="mb-6 border rounded p-4 shadow-sm bg-white">
          <h3 className="text-lg font-bold text-blue-700 mb-2">
            {group.name}
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {groupMembers[group.name]?.length || 0} members
            </span>
          </h3>

          <p className="text-sm text-gray-600 mb-2"><span className='font-semibold'>Desc:</span> {group.description}</p>

          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left text-[14px] sm:text-sm md:text-base">S/N</th>
                <th className="border p-2 text-left text-[14px] sm:text-sm md:text-base">Member Name</th>
                <th className="border p-2 text-left text-[14px] sm:text-sm md:text-base">Email</th>
              </tr>
            </thead>
            <tbody>
              {groupMembers[group.name]?.length > 0 ? (
                groupMembers[group.name].map((user, index) => (
                  <tr key={user._id}>
                    <td className="border p-2 text-[13px] md:text-sm">{index + 1}</td>
                    <td className="border p-2 text-[13px] md:text-sm">{user.firstName} {user.lastName}</td>
                    <td className="border p-2 text-[13px] md:text-sm">{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="border p-2 text-gray-500 italic text-center">
                    No members assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
