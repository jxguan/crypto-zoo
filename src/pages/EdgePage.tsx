import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight, Edit, Save, X, AlertTriangle } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import LatexRenderer from '../components/LatexRenderer';
import { useState, useEffect } from 'react';
import type { Edge, Vertex, Reference, User } from '../types/crypto';

interface EdgePageProps {
  currentUser?: User | null;
}

export default function EdgePage({ currentUser }: EdgePageProps) {
  const { id } = useParams<{ id: string }>();
  const [edge, setEdge] = useState<Edge | null>(null);
  const [sourceVertices, setSourceVertices] = useState<Vertex[]>([]);
  const [targetVertices, setTargetVertices] = useState<Vertex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Edge>>({});
  const [email, setEmail] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const loadEdgeData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const edgeData = await supabaseService.getEdgeById(id);
        if (edgeData) {
          setEdge(edgeData);
          
          // Load related vertices
          const sourcePromises = edgeData.source_vertices.map((vertexId: string) => 
            supabaseService.getVertexById(vertexId)
          );
          const targetPromises = edgeData.target_vertices.map((vertexId: string) => 
            supabaseService.getVertexById(vertexId)
          );
          
          const [sourceResults, targetResults] = await Promise.all([
            Promise.all(sourcePromises),
            Promise.all(targetPromises)
          ]);
          
          setSourceVertices(sourceResults.filter((v): v is Vertex => v !== null));
          setTargetVertices(targetResults.filter((v): v is Vertex => v !== null));
        } else {
          setEdge(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load edge');
        setEdge(null);
      } finally {
        setLoading(false);
      }
    };

    loadEdgeData();
  }, [id]);

  const handleEditClick = () => {
    if (edge) {
      setEditForm({
        name: edge.name || '',
        type: edge.type || 'construction',
        overview: edge.overview || '',
        theorem: edge.theorem || '',
        construction: edge.construction || '',
        proof_sketch: edge.proof_sketch || '',
        model: edge.model || 'plain',
        notes: edge.notes || '',
        tags: edge.tags || [],
        source_vertices: edge.source_vertices || [],
        target_vertices: edge.target_vertices || [],
        references_data: edge.references_data || [],
        wip: edge.wip || false
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!edge || !id) return;
    
    // If admin, show confirmation dialog
    if (currentUser?.role === 'admin') {
      setShowConfirmDialog(true);
      return;
    }
    
    // For non-admin users, submit edit request
    await handleSubmitEditRequest();
  };

  const handleConfirmSave = async () => {
    if (!edge || !id) return;
    
    try {
      const updatedEdge = await supabaseService.updateEdge(id, editForm);
      setEdge(updatedEdge);
      setIsEditing(false);
      setEditForm({});
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Failed to update edge:', err);
    }
  };

  const handleSubmitEditRequest = async () => {
    if (!edge || !id) return;
    
    try {
      const editRequest = {
        type: 'edge' as const,
        target_id: id,
        data: editForm,
        action: 'update' as const,
        notes: `Edit request for edge ${edge.name}`,
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

  const handleInputChange = (field: keyof Edge, value: string | string[] | boolean | Reference[]) => {
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
          <div className="text-red-500 mb-4">Error loading edge</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!edge) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Construction Not Found</h1>
        <p className="text-gray-600 mb-6">The cryptographic construction you're looking for doesn't exist.</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{edge.name}</h1>
          <p className="text-xl text-gray-600 capitalize">{edge.type}</p>
        </div>
        <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full capitalize">
          {edge.model}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              <LatexRenderer content={edge.overview} />
            </p>
          </div>

          {/* Theorem */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Theorem</h2>
            <p className="text-gray-700 leading-relaxed">
              <LatexRenderer content={edge.theorem} />
            </p>
          </div>

          {/* Construction */}
          {edge.construction && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Construction</h2>
              <p className="text-gray-700 leading-relaxed">
                <LatexRenderer content={edge.construction} />
              </p>
            </div>
          )}

          {/* Proof Sketch */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Proof Sketch</h2>
            <p className="text-gray-700 leading-relaxed">
              <LatexRenderer content={edge.proof_sketch} />
            </p>
          </div>



          {/* References */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">References</h2>
            <div className="space-y-3">
              {edge.references_data.map((ref: Reference, index: number) => (
                <div key={index} className="border-l-4 border-primary-200 pl-4">
                  <div className="font-medium text-gray-900">{ref.title}</div>
                  <div className="text-sm text-gray-600">{ref.author}, {ref.year}</div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors text-sm"
                  >
                    View paper <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Related Primitives */}
        <div className="space-y-6">
          {/* Source Primitives */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Source Primitives ({sourceVertices.length})
            </h3>
            <div className="space-y-2">
              {sourceVertices.map((vertex) => (
                <Link
                  key={vertex.id}
                  to={`/v/${vertex.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{vertex.name}</div>
                      <div className="text-sm text-gray-500">{vertex.abbreviation}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Target Primitives */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Target Primitives ({targetVertices.length})
            </h3>
            <div className="space-y-2">
              {targetVertices.map((vertex) => (
                <Link
                  key={vertex.id}
                  to={`/v/${vertex.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{vertex.name}</div>
                      <div className="text-sm text-gray-500">{vertex.abbreviation}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Relationship Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationship Type</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 capitalize">{edge.type}</div>
                  <div className="text-sm text-gray-500">
                    {edge.type === 'construction' && 'Shows how to build one primitive from another'}
                    {edge.type === 'impossibility' && 'Shows that one primitive cannot be built from another'}
                    {edge.type === 'reduction' && 'Shows a security reduction between primitives'}
                    {edge.type === 'separation' && 'Shows that primitives are independent'}
                  </div>
                </div>
              </div>
            </div>
                     </div>
         </div>
       </div>

               {/* Edit Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Construction</h2>
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
                   placeholder="Enter construction name"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                 <select
                   value={editForm.type || 'construction'}
                   onChange={(e) => handleInputChange('type', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 >
                   <option value="construction">Construction</option>
                   <option value="separation">Separation</option>
                   <option value="impossibility">Impossibility</option>
                 </select>
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
               <select
                 value={editForm.model || 'plain'}
                 onChange={(e) => handleInputChange('model', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
               >
                 <option value="plain">Plain</option>
                 <option value="random oracle">Random Oracle</option>
                 <option value="crs">CRS</option>
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
               <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
               <textarea
                 value={editForm.overview || ''}
                 onChange={(e) => handleInputChange('overview', e.target.value)}
                 rows={4}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter overview"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Theorem</label>
               <textarea
                 value={editForm.theorem || ''}
                 onChange={(e) => handleInputChange('theorem', e.target.value)}
                 rows={4}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter theorem statement"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Construction</label>
               <textarea
                 value={editForm.construction || ''}
                 onChange={(e) => handleInputChange('construction', e.target.value)}
                 rows={6}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter construction details"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Proof Sketch</label>
               <textarea
                 value={editForm.proof_sketch || ''}
                 onChange={(e) => handleInputChange('proof_sketch', e.target.value)}
                 rows={6}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter proof sketch"
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
               <label className="block text-sm font-medium text-gray-700 mb-2">Source Vertices (comma-separated IDs)</label>
               <input
                 type="text"
                 value={Array.isArray(editForm.source_vertices) ? editForm.source_vertices.join(', ') : ''}
                 onChange={(e) => handleInputChange('source_vertices', e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter source vertex IDs separated by commas"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Target Vertices (comma-separated IDs)</label>
               <input
                 type="text"
                 value={Array.isArray(editForm.target_vertices) ? editForm.target_vertices.join(', ') : ''}
                 onChange={(e) => handleInputChange('target_vertices', e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 placeholder="Enter target vertex IDs separated by commas"
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
              Click the Edit button to modify this construction
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