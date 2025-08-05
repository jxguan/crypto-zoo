import React, { useState } from 'react';
import { EditRequestFormComponent } from '../components/EditRequestForm';
import { useNavigate } from 'react-router-dom';

export const SubmitEditPage: React.FC = () => {
  const [type, setType] = useState<'vertex' | 'edge'>('vertex');
  const [targetId, setTargetId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setShowForm(true);
  };

  const handleSuccess = () => {
    alert('Edit request submitted successfully! It will be reviewed by an admin.');
    navigate('/');
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <EditRequestFormComponent
          type={type}
          targetId={targetId || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Edit Request</h1>
          <p className="mt-2 text-gray-600">
            Help improve the Crypto Zoo by suggesting edits or additions
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to submit?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="vertex"
                    checked={type === 'vertex'}
                    onChange={(e) => setType(e.target.value as 'vertex' | 'edge')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>Vertex</strong> - A cryptographic primitive (e.g., hash function, encryption scheme)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="edge"
                    checked={type === 'edge'}
                    onChange={(e) => setType(e.target.value as 'vertex' | 'edge')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>Edge</strong> - A relationship between primitives (e.g., construction, reduction)
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="create"
                    checked={!targetId}
                    onChange={() => setTargetId('')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>Create new</strong> {type}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="update"
                    checked={!!targetId}
                    onChange={() => setTargetId('')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>Update existing</strong> {type}
                  </span>
                </label>
              </div>
            </div>

            {targetId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {type.charAt(0).toUpperCase() + type.slice(1)} ID
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder={`Enter the ID of the ${type} to update`}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 