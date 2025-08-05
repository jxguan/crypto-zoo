import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import type { Vertex, Edge, EditRequestForm } from '../types/crypto';

interface EditRequestFormProps {
  type: 'vertex' | 'edge';
  targetId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditRequestFormComponent: React.FC<EditRequestFormProps> = ({
  type,
  targetId,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingItem, setExistingItem] = useState<Vertex | Edge | null>(null);
  const [formData, setFormData] = useState<Partial<Vertex | Edge>>({});
  const [action, setAction] = useState<'create' | 'update' | 'delete'>('create');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (targetId) {
      loadExistingItem();
      setAction('update');
    }
  }, [targetId]);

  const loadExistingItem = async () => {
    if (!targetId) return;
    
    try {
      const item = type === 'vertex' 
        ? await supabaseService.getVertexById(targetId)
        : await supabaseService.getEdgeById(targetId);
      
      if (item) {
        setExistingItem(item);
        setFormData(item);
      }
    } catch (err) {
      setError('Failed to load existing item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const request: EditRequestForm = {
        type,
        target_id: targetId,
        data: formData,
        action,
        notes: notes.trim() || undefined,
        email: email.trim() || undefined
      };

      await supabaseService.submitEditRequest(request);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit edit request');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderVertexForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateFormData('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Abbreviation</label>
        <input
          type="text"
          value={formData.abbreviation || ''}
          onChange={(e) => updateFormData('abbreviation', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <input
          type="text"
          value={formData.type || ''}
          onChange={(e) => updateFormData('type', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
        <input
          type="text"
          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
          onChange={(e) => updateFormData('tags', e.target.value.split(',').map(tag => tag.trim()))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Definition</label>
        <textarea
          value={formData.definition || ''}
          onChange={(e) => updateFormData('definition', e.target.value)}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateFormData('notes', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );

  const renderEdgeForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateFormData('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type || ''}
          onChange={(e) => updateFormData('type', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select type</option>
          <option value="construction">Construction</option>
          <option value="impossibility">Impossibility</option>
          <option value="reduction">Reduction</option>
          <option value="separation">Separation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Overview</label>
        <textarea
          value={formData.overview || ''}
          onChange={(e) => updateFormData('overview', e.target.value)}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <input
          type="text"
          value={formData.model || ''}
          onChange={(e) => updateFormData('model', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
        <input
          type="text"
          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
          onChange={(e) => updateFormData('tags', e.target.value.split(',').map(tag => tag.trim()))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateFormData('notes', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Submit Edit Request
        </h2>
        <p className="text-gray-600">
          {targetId ? 'Update existing' : 'Create new'} {type}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {targetId && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'create' | 'update' | 'delete')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        )}

        {action !== 'delete' && (
          type === 'vertex' ? renderVertexForm() : renderEdgeForm()
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email (optional - for anonymous submissions)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="your.email@example.com"
          />
          <p className="mt-1 text-sm text-gray-500">
            Provide your email if you'd like to be notified about the status of your request
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes for reviewers (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Explain your changes or provide additional context..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}; 