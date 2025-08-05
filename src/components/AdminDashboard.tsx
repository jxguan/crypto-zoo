import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import type { EditRequest, User, Vertex, Edge } from '../types/crypto';
import { ChangeDisplay } from './ChangeDisplay';

interface AdminDashboardProps {
  currentUser: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Authentication Required</h3>
          <p className="text-red-700">You need to be logged in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<EditRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [originalData, setOriginalData] = useState<Vertex | Edge | null>(null);
  const [loadingOriginalData, setLoadingOriginalData] = useState(false);

  useEffect(() => {
    loadEditRequests();
  }, [statusFilter]);

  const loadEditRequests = async () => {
    try {
      setLoading(true);
      const requests = statusFilter === 'all' 
        ? await supabaseService.getEditRequests()
        : await supabaseService.getEditRequests(statusFilter);
      setEditRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load edit requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await supabaseService.updateEditRequestStatus(requestId, status, reviewNotes);
      setSelectedRequest(null);
      setReviewNotes('');
      setOriginalData(null);
      loadEditRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request status');
    }
  };

  const handleReviewClick = async (request: EditRequest) => {
    setSelectedRequest(request);
    setReviewNotes('');
    setLoadingOriginalData(true);
    
    try {
      const original = await supabaseService.getOriginalDataForEditRequest(request);
      setOriginalData(original);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load original data');
    } finally {
      setLoadingOriginalData(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getActionBadge = (action: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (action) {
      case 'create':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'update':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'delete':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Access Denied</h3>
          <p className="text-red-700">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Review and manage edit requests</p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading edit requests...</div>
        </div>
      ) : editRequests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No edit requests found.</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {editRequests.map((request) => (
              <li key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                      <span className={getActionBadge(request.action)}>
                        {request.action}
                      </span>
                      <span className="text-sm text-gray-500">
                        {request.type}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.action === 'create' ? 'Create new' : 'Update'} {request.type}
                        {request.target_id && ` (ID: ${request.target_id})`}
                      </h3>
                      {request.notes && (
                        <p className="mt-1 text-sm text-gray-600">
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        Submitted by: {request.submitted_by} on {formatDate(request.submitted_at)}
                      </p>
                      {request.reviewed_by && (
                        <p className="mt-1 text-sm text-gray-500">
                          Reviewed by: {request.reviewed_by} on {formatDate(request.reviewed_at!)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleReviewClick(request)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Edit Request
                </h3>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setOriginalData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Request Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Action:</strong> {selectedRequest.action} {selectedRequest.type}</p>
                      {selectedRequest.target_id && (
                        <p><strong>Target ID:</strong> {selectedRequest.target_id}</p>
                      )}
                      {selectedRequest.notes && (
                        <p><strong>Submitter Notes:</strong> {selectedRequest.notes}</p>
                      )}
                      <p><strong>Submitted:</strong> {formatDate(selectedRequest.submitted_at)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes (optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Add notes about your decision..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSelectedRequest(null);
                        setOriginalData(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReview(selectedRequest.id, 'rejected')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReview(selectedRequest.id, 'approved')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                  </div>
                </div>
                
                {/* Changes Display */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Changes</h4>
                  {loadingOriginalData ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">Loading original data...</div>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <ChangeDisplay 
                        editRequest={selectedRequest} 
                        originalData={originalData} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 