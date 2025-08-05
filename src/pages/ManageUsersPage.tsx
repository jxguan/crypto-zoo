import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/crypto';
import { Users, Edit, Save, X, User as UserIcon, Shield } from 'lucide-react';

interface ManageUsersPageProps {
  currentUser: User | null;
}

interface EditableUser extends User {
  isEditing?: boolean;
  tempFirstName?: string;
  tempLastName?: string;
  tempRole?: 'user' | 'admin' | 'pending';
}

export default function ManageUsersPage({ currentUser }: ManageUsersPageProps) {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    if (currentUser.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    loadUsers();
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      // Get all users from the database
      const dataPromise = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as { data: User[] | null; error: any };

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        setUsers([]);
        return;
      }

      setUsers(data.map(user => ({
        ...user,
        isEditing: false,
        tempFirstName: user.first_name || '',
        tempLastName: user.last_name || '',
        tempRole: user.role
      })));
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isEditing: true }
        : user
    ));
  };

  const cancelEditing = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            isEditing: false,
            tempFirstName: user.first_name || '',
            tempLastName: user.last_name || '',
            tempRole: user.role
          }
        : user
    ));
  };

  const saveUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      setError(null);
      
      // Update user in database
      const { error } = await supabase
        .from('users')
        .update({
          first_name: user.tempFirstName,
          last_name: user.tempLastName,
          role: user.tempRole
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? {
              ...u,
              first_name: user.tempFirstName || '',
              last_name: user.tempLastName || '',
              role: user.tempRole || 'user',
              isEditing: false
            }
          : u
      ));

      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const getDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    } else {
      return user.email;
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
          <p className="text-sm text-gray-500 mt-2">Current user: {currentUser?.email || 'None'}</p>
          <p className="text-sm text-gray-500">Role: {currentUser?.role || 'None'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              View and manage user accounts, names, and roles.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                                             {user.isEditing ? (
                         <div className="space-y-2">
                           <input
                             type="text"
                             value={user.tempFirstName || ''}
                             onChange={(e) => setUsers(users.map(u => 
                               u.id === user.id ? { ...u, tempFirstName: e.target.value } : u
                             ))}
                             className="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                             placeholder="First name"
                           />
                           <input
                             type="text"
                             value={user.tempLastName || ''}
                             onChange={(e) => setUsers(users.map(u => 
                               u.id === user.id ? { ...u, tempLastName: e.target.value } : u
                             ))}
                             className="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                             placeholder="Last name"
                           />
                         </div>
                       ) : (
                        <div className="flex items-center">
                          <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getDisplayName(user)}
                            </div>
                            {(!user.first_name && !user.last_name) && (
                              <div className="text-xs text-gray-500">No name set</div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isEditing ? (
                        <select
                          value={user.tempRole}
                          onChange={(e) => setUsers(users.map(u => 
                            u.id === user.id ? { ...u, tempRole: e.target.value as 'user' | 'admin' | 'pending' } : u
                          ))}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           user.role === 'admin' 
                             ? 'bg-red-100 text-red-800' 
                             : user.role === 'pending'
                             ? 'bg-yellow-100 text-yellow-800'
                             : 'bg-gray-100 text-gray-800'
                         }`}>
                           {user.role}
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveUser(user.id)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </button>
                          <button
                            onClick={() => cancelEditing(user.id)}
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(user.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Total users: {users.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 