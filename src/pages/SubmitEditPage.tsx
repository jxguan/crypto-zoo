import React, { useState } from 'react';
import { EditRequestFormComponent } from '../components/EditRequestForm';
import { useNavigate } from 'react-router-dom';

export const SubmitEditPage: React.FC = () => {
  const [type, setType] = useState<'vertex' | 'edge'>('vertex');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setShowForm(true);
  };

  const handleSuccess = () => {
    alert('New item submitted successfully! It will be reviewed by an admin.');
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
          <p className="mt-2 text-gray-600">
            Help expand the Crypto Zoo by adding new cryptographic primitives or relationships
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to add?
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

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Creating New Items</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      You're about to create a new {type}. This will be submitted for review by an admin before being added to the database.
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                Create New {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 