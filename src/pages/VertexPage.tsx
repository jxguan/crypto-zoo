import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight, Edit, Save, X, AlertTriangle } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import LatexRenderer from '../components/LatexRenderer';
import { useState, useEffect } from 'react';
import type { Vertex, Reference, User } from '../types/crypto';

interface VertexPageProps {
  currentUser?: User | null;
}

export default function VertexPage({ currentUser }: VertexPageProps) {
  const { id } = useParams<{ id: string }>();
  const [vertex, setVertex] = useState<Vertex | null>(null);
  const [incoming, setIncoming] = useState<Vertex[]>([]);
  const [outgoing, setOutgoing] = useState<Vertex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Vertex>>({});
  const [email, setEmail] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadVertexData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const vertexData = await supabaseService.getVertexById(id);
        if (vertexData) {
          setVertex(vertexData);
          const relatedData = await supabaseService.getRelatedVertices(id);
          setIncoming(relatedData.incoming);
          setOutgoing(relatedData.outgoing);
        } else {
          setVertex(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vertex');
        setVertex(null);
      } finally {
        setLoading(false);
      }
    };

    loadVertexData();
  }, [id]);

  const handleEditClick = () => {
    if (vertex) {
      setEditForm({
        name: vertex.name || '',
        abbreviation: vertex.abbreviation || '',
        type: vertex.type || 'primitive',
        tags: vertex.tags || [],
        description: vertex.description || '',
        definition: vertex.definition || '',
        notes: vertex.notes || '',
        references_data: vertex.references_data || [],
        related_vertices: vertex.related_vertices || [],
        wip: vertex.wip || false
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!vertex || !id) return;
    
    // If admin, show confirmation dialog
    if (currentUser?.role === 'admin') {
      setShowConfirmDialog(true);
      return;
    }
    
    // For non-admin users, submit edit request
    await handleSubmitEditRequest();
  };

  const handleConfirmSave = async () => {
    if (!vertex || !id) return;
    
    try {
      const updatedVertex = await supabaseService.updateVertex(id, editForm);
      setVertex(updatedVertex);
      setIsEditing(false);
      setEditForm({});
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Failed to update vertex:', err);
    }
  };

  const handleSubmitEditRequest = async () => {
    if (!vertex || !id) return;
    
    try {
      const editRequest = {
        type: 'vertex' as const,
        target_id: id,
        data: editForm,
        action: 'update' as const,
        notes: `Edit request for vertex ${vertex.name}`,
        email: currentUser ? undefined : email
      };

      await supabaseService.submitEditRequest(editRequest);
      setIsEditing(false);
      setEditForm({});
      setEmail('');
      // You could add a success notification here
    } catch (err) {
      console.error('Failed to submit edit request:', err);
    }
  };

  const handleInputChange = (field: keyof Vertex, value: string | string[] | boolean | Reference[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading vertex</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!vertex) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Primitive Not Found</h1>
        <p className="text-gray-600 mb-6">The cryptographic primitive you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-3xl p-8">
        <div className="flex items-center space-x-6">
          {/* Removed back button */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">{vertex.name}</h1>
              <span className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-full capitalize">
                {vertex.type}
              </span>
              <span className="inline-block px-2 py-1 ml-2 text-xs font-medium bg-gray-100 text-gray-500 rounded capitalize">
                {vertex.tags && vertex.tags.join(', ')}
              </span>
            </div>
            <p className="text-2xl text-gray-600 font-mono">{vertex.abbreviation}</p>
          </div>
        </div>
        {/* Description directly under header */}
        <div className="mt-6 text-gray-700 leading-relaxed text-lg">
          <LatexRenderer content={vertex.description} />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Definition */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <span className="text-primary-600 font-bold">D</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Definition</h2>
            </div>
            <div className="text-gray-700 leading-relaxed text-lg">
              <LatexRenderer content={vertex.definition} />
            </div>
          </div>

          {/* References */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-600 font-bold">📚</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">References</h2>
            </div>
            <div className="space-y-6">
              {vertex.references_data.map((ref: Reference, index: number) => (
                <div key={index} className="border-l-4 border-primary-200 pl-6 py-4 bg-primary-50/30 rounded-r-xl">
                  <div className="font-semibold text-gray-900 text-lg mb-2">{ref.title}</div>
                  <div className="text-gray-600 mb-3 font-medium">{ref.author}, {ref.year}</div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors font-medium hover:underline"
                  >
                    View paper <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Relationships */}
        <div className="space-y-8">
          {/* Can be built from (incoming) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Can be built from ({incoming.length})</h3>
            {incoming.length > 0 ? (
              <div className="space-y-3">
                {incoming.map((relatedVertex) => (
                  <Link
                    key={relatedVertex.id}
                    to={`/v/${relatedVertex.id}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {relatedVertex.name}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">{relatedVertex.abbreviation}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🔗</div>
                <p className="text-gray-500 font-medium">No known constructions</p>
              </div>
            )}
          </div>

          {/* Can be used to build (outgoing) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Can be used to build ({outgoing.length})</h3>
            {outgoing.length > 0 ? (
              <div className="space-y-3">
                {outgoing.map((relatedVertex) => (
                  <Link
                    key={relatedVertex.id}
                    to={`/v/${relatedVertex.id}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {relatedVertex.name}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">{relatedVertex.abbreviation}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🔗</div>
                <p className="text-gray-500 font-medium">No known constructions</p>
              </div>
            )}
          </div>

          {/* Implies (empty for now) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Implies</h3>
            <div className="text-gray-400 text-center py-8">(Coming soon)</div>
          </div>

          {/* Equivalent (empty for now) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Equivalent</h3>
            <div className="text-gray-400 text-center py-8">(Coming soon)</div>
          </div>

                     {/* Related notions (empty for now) */}
           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
             <h3 className="text-xl font-bold text-gray-900 mb-4">Related notions</h3>
             <div className="text-gray-400 text-center py-8">(Coming soon)</div>
           </div>
         </div>
       </div>

               {/* Edit Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Primitive</h2>
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {currentUser?.role === 'admin' ? 'Save' : 'Submit Edit Request'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

         {isEditing ? (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                 <input
                   type="text"
                   value={editForm.name || ''}
                   onChange={(e) => handleInputChange('name', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter primitive name"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Abbreviation</label>
                 <input
                   type="text"
                   value={editForm.abbreviation || ''}
                   onChange={(e) => handleInputChange('abbreviation', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter abbreviation"
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
               <select
                 value={editForm.type || 'primitive'}
                 onChange={(e) => handleInputChange('type', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
               >
                 <option value="primitive">Primitive</option>
                 <option value="assumption">Assumption</option>
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
               <input
                 type="text"
                 value={Array.isArray(editForm.tags) ? editForm.tags.join(', ') : ''}
                 onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter tags separated by commas"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
               <textarea
                 value={editForm.description || ''}
                 onChange={(e) => handleInputChange('description', e.target.value)}
                 rows={3}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter description"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Definition</label>
               <textarea
                 value={editForm.definition || ''}
                 onChange={(e) => handleInputChange('definition', e.target.value)}
                 rows={6}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter mathematical definition"
               />
             </div>

                                        <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
               <textarea
                 value={editForm.notes || ''}
                 onChange={(e) => handleInputChange('notes', e.target.value)}
                 rows={3}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter additional notes"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Related Vertices (comma-separated IDs)</label>
               <input
                 type="text"
                 value={Array.isArray(editForm.related_vertices) ? editForm.related_vertices.join(', ') : ''}
                 onChange={(e) => handleInputChange('related_vertices', e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter related vertex IDs separated by commas"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">References (JSON format)</label>
               <textarea
                 value={editForm.references_data ? JSON.stringify(editForm.references_data, null, 2) : ''}
                 onChange={(e) => {
                   try {
                     const parsed = JSON.parse(e.target.value);
                     handleInputChange('references_data', parsed);
                   } catch {
                     // Invalid JSON, don't update
                   }
                 }}
                 rows={6}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                 placeholder='[{"title": "Paper Title", "author": "Author Name", "year": 2023, "url": "https://example.com"}]'
               />
               <p className="text-xs text-gray-500 mt-1">Enter references in JSON format</p>
             </div>

             <div className="flex items-center space-x-2">
               <input
                 type="checkbox"
                 id="wip"
                 checked={editForm.wip || false}
                 onChange={(e) => handleInputChange('wip', e.target.checked)}
                 className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
               />
               <label htmlFor="wip" className="text-sm font-medium text-gray-700">
                 Work in Progress
               </label>
             </div>

             {/* Email field for non-logged in users */}
             {!currentUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (for notifications)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Click the Edit button to modify this primitive
            </div>
          )}
        </div>

        {/* Confirmation Dialog for Admin */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Update</h3>
              </div>
              <p className="text-gray-600 mb-6">
                You are about to directly update the database. This action cannot be undone. Are you sure you want to proceed?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Update
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } 