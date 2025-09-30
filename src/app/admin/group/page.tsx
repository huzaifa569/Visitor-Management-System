'use client';

import { useEffect, useState } from 'react';
import { adminAPI, hallAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import GroupCreator from '@/components/GroupCreate';
import GroupMapper from '@/components/GroupMapper';
import GroupListWithMembers from '@/components/GroupListWithMemders';

function HallApiManager({ onSave }: { onSave: (hall: string, url: string) => void }) {
  const [hall, setHall] = useState('');
  const [apiUrl, setApiUrl] = useState('');

  const handleSave = () => {
    if (hall && apiUrl) {
      onSave(hall, apiUrl);
      setHall('');
      setApiUrl('');
    }
  };

  return (
    <div className="my-4">
      <h2 className="font-bold text-lg">Add Hall API Route</h2>
      <div className="flex flex-col gap-2 mt-2">
        <input
          value={hall}
          onChange={(e) => setHall(e.target.value)}
          placeholder="Hall name (e.g. East Wing)"
          className="border px-2 py-1 rounded"
        />
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="API URL (e.g. https://hall.example.com/api/groups)"
          className="border px-2 py-1 rounded"
        />
        <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded w-fit">
          Save API Route
        </button>
      </div>
    </div>
  );
}

export default function AdminGroupPage() {
  const { token } = useAuth();
  const [hallApis, setHallApis] = useState<Record<string, string>>({});
  const [selectedHall, setSelectedHall] = useState<string>('');

  const loadGroups = async () => {
  if (!token) return;

  try {
    if (selectedHall && hallApis[selectedHall]) {
      const groups = await hallAPI.fetchExternalGroups(selectedHall, token);
      console.log('Groups from hall API:', groups);
    } else {
      await adminAPI.fetchGroups(token);
    }
  } catch (err: any) {
    console.error('Failed to load groups:', err.message);
  }
};

  useEffect(() => {
    loadGroups();
  }, [token, selectedHall]);

  const handleSaveApi = async (hall: string, url: string) => {
    try {
      await hallAPI.saveHallApi(hall, url); // save to backend
      setHallApis((prev) => ({ ...prev, [hall]: url })); // update local
    } catch (err: any) {
      console.error('Failed to save hall API:', err.message);
    }
  };

  return (
    <div>
      <h1 className="text-lg sm:text-2xl lg:text-3xl text-gray-900 font-bold">Group Management</h1>
      <HallApiManager onSave={handleSaveApi} />

      <div className="my-4">
        <label className="font-semibold">Select Hall:</label>
        <select
          value={selectedHall}
          onChange={(e) => setSelectedHall(e.target.value)}
          className="border px-2 py-1 ml-2 rounded"
        >
          <option value="">Internal Groups</option>
          {Object.keys(hallApis).map((hall) => (
            <option key={hall} value={hall}>
              {hall}
            </option>
          ))}
        </select>
      </div>

      <GroupCreator refreshGroups={loadGroups} />
      <hr />
      <GroupMapper />
      <hr />
      <GroupListWithMembers />
    </div>
  );
}
