import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../lib/api';
import { UserRole } from '../types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  universityVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Users() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');

  const { data, isLoading } = useQuery(
    ['users', { role: roleFilter }],
    () =>
      api.get('/admin/users', { params: { role: roleFilter || undefined } }).then((res) => {
        const { data, total } = res.data.data as { data: User[]; total: number };
        return { users: data, total };
      }),
  );

  const updateUserMutation = useMutation(
    ({ id, ...updates }: { id: string; [key: string]: any }) =>
      api.patch(`/admin/users/${id}`, updates).then((res) => res.data),
    {
      onSuccess: () => queryClient.invalidateQueries('users'),
    },
  );

  const filteredUsers = data?.users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Users</h2>
        <p className="text-sm text-primary-700 mt-1">Manage platform users</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-primary-500 absolute left-3 top-2.5" />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
          className="px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value={UserRole.STUDENT}>Student</option>
          <option value={UserRole.LANDLORD}>Landlord</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-center py-10">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-sm border border-primary-100 overflow-hidden">
            <thead className="bg-primary-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Created</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-primary-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-primary-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-primary-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-800 capitalize">
                      {user.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.isVerified ? 'badge-available' : 'badge-pending'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => updateUserMutation.mutate({ id: user.id, isActive: !user.isActive })}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        user.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
