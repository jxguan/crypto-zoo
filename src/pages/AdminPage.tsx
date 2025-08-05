import React from 'react';
import { AdminDashboard } from '../components/AdminDashboard';
import type { User } from '../types/crypto';

interface AdminPageProps {
  currentUser: User | null;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser }) => {
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">You need to be logged in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard currentUser={currentUser} />
    </div>
  );
}; 