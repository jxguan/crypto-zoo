import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight, Edit, Save, X, AlertTriangle, ArrowUp, ArrowDown, Eye, Edit3 } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import LatexRenderer from '../components/LatexRenderer';
import { useState, useEffect, useRef } from 'react';
import type { Vertex, Reference, User } from '../types/crypto';

interface VertexPageProps {
  currentUser?: User | null;
}

export default function VertexPage({ currentUser }: VertexPageProps) {
  const { id } = useParams<{ id: string }>();
  const [vertex, setVertex] = useState<Vertex | null>(null);
  const [incoming, setIncoming] = useState<Vertex[]>([]);
  const [outgoing, setOutgoing] = useState<Vertex[]>([]);
  const [relatedVertices, setRelatedVertices] = useState<Vertex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditSection, setShowEditSection] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Vertex> & { tags_raw?: string; related_vertices_raw?: string }>({});
  const [email, setEmail] = useState('');
  const [reviewerComments, setReviewerComments] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [emailError, setEmailError] = useState('');
  const editSectionRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Preview state for different fields
  const [previewDescription, setPreviewDescription] = useState(false);
  const [previewDefinition, setPreviewDefinition] = useState(false);
  const [previewNotes, setPreviewNotes] = useState(false);

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
          
          // Load related vertices if they exist
          if (vertexData.related_vertices && vertexData.related_vertices.length > 0) {
            const relatedVerticesData = await supabaseService.getVerticesByIds(vertexData.related_vertices);
            setRelatedVertices(relatedVerticesData);
          } else {
            setRelatedVertices([]);
          }
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
        tags_raw: Array.isArray(vertex.tags) ? vertex.tags.join(', ') : '',
        description: vertex.description || '',
        definition: vertex.definition || '',
        notes: vertex.notes || '',
        references_data: vertex.references_data || [],
        related_vertices: vertex.related_vertices || [],
        related_vertices_raw: Array.isArray(vertex.related_vertices) ? vertex.related_vertices.join(', ') : '',
        wip: vertex.wip || false
      });
      setIsEditing(true);
      setShowEditSection(true);
      
      // Scroll to edit section after a short delay to ensure it's rendered
      setTimeout(() => {
        editSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowEditSection(false);
    setEditForm({});
    setEmail('');
    setReviewerComments('');
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
      // Process raw strings into arrays
      const processedForm = { ...editForm };
      if (editForm.tags_raw !== undefined) {
        processedForm.tags = editForm.tags_raw.split(',').map(tag => tag.trim()).filter(tag => tag);
        delete processedForm.tags_raw;
      }
      if (editForm.related_vertices_raw !== undefined) {
        processedForm.related_vertices = editForm.related_vertices_raw.split(',').map(id => id.trim()).filter(id => id);
        delete processedForm.related_vertices_raw;
      }
      
      const updatedVertex = await supabaseService.updateVertex(id, processedForm);
      setVertex(updatedVertex);
      setIsEditing(false);
      setShowEditSection(false);
      setEditForm({});
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Failed to update vertex:', err);
    }
  };

  const handleSubmitEditRequest = async () => {
    if (!vertex || !id) return;
    
    // Validate email for non-logged in users
    if (!currentUser && !email.trim()) {
      setEmailError('Email is required for non-logged in users');
      // Scroll to email input field
      setTimeout(() => {
        emailInputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
      return;
    }
    
    // Clear any previous email errors
    setEmailError('');
    
    try {
      // Process raw strings into arrays
      const processedForm = { ...editForm };
      if (editForm.tags_raw !== undefined) {
        processedForm.tags = editForm.tags_raw.split(',').map(tag => tag.trim()).filter(tag => tag);
        delete processedForm.tags_raw;
      }
      if (editForm.related_vertices_raw !== undefined) {
        processedForm.related_vertices = editForm.related_vertices_raw.split(',').map(id => id.trim()).filter(id => id);
        delete processedForm.related_vertices_raw;
      }
      
             const editRequest = {
         type: 'vertex' as const,
         target_id: id,
         data: processedForm,
         action: 'update' as const,
         notes: `Edit request for vertex ${vertex.name}${reviewerComments ? `\n\nReviewer Comments: ${reviewerComments}` : ''}`,
         email: currentUser ? undefined : email,
         first_name: currentUser ? undefined : '',
         last_name: currentUser ? undefined : ''
       };

      await supabaseService.submitEditRequest(editRequest);
             setIsEditing(false);
       setShowEditSection(false);
       setEditForm({});
       setEmail('');
       setReviewerComments('');
       setEmailError('');
       // You could add a success notification here
    } catch (err) {
      console.error('Failed to submit edit request:', err);
    }
  };

  const handleInputChange = (field: keyof Vertex | 'tags_raw' | 'related_vertices_raw', value: string | string[] | boolean | Reference[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Reference management functions
  const handleReferenceChange = (idx: number, field: keyof Reference, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      references_data: (prev.references_data || []).map((ref, i) => 
        i === idx ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const addReference = () => {
    setEditForm(prev => ({
      ...prev,
      references_data: [...(prev.references_data || []), { 
        title: '', 
        author: '', 
        year: new Date().getFullYear(), 
        url: '' 
      }]
    }));
  };

  const removeReference = (idx: number) => {
    setEditForm(prev => ({
      ...prev,
      references_data: (prev.references_data || []).filter((_, i) => i !== idx)
    }));
  };

  const moveReferenceUp = (idx: number) => {
    if (idx === 0) return;
    setEditForm(prev => {
      const newRefs = [...(prev.references_data || [])];
      [newRefs[idx], newRefs[idx - 1]] = [newRefs[idx - 1], newRefs[idx]];
      return { ...prev, references_data: newRefs };
    });
  };

  const moveReferenceDown = (idx: number) => {
    setEditForm(prev => {
      const newRefs = [...(prev.references_data || [])];
      if (idx >= newRefs.length - 1) return prev;
      [newRefs[idx], newRefs[idx + 1]] = [newRefs[idx + 1], newRefs[idx]];
      return { ...prev, references_data: newRefs };
    });
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
               {vertex.tags && vertex.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1 ml-2">
                   {vertex.tags.map((tag, index) => (
                     <span key={index} className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded capitalize">
                       {tag}
                     </span>
                   ))}
                 </div>
               )}
             </div>
             <p className="text-2xl text-gray-600 font-mono">{vertex.abbreviation}</p>
           </div>
         </div>
         {/* Description directly under header */}
         <div className="mt-6 text-gray-700 leading-relaxed text-lg">
           <LatexRenderer content={vertex.description} />
         </div>
       </div>

       {/* WIP Warning */}
       {vertex.wip && (
         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
           <div className="flex items-start space-x-3">
             <div className="flex-shrink-0">
               <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
               </svg>
             </div>
             <div className="flex-1">
               <h3 className="text-lg font-semibold text-yellow-800 mb-2">Work in Progress</h3>
               <p className="text-yellow-700 mb-4">
                 This cryptographic primitive is currently under development. The information may be incomplete or subject to change.
               </p>
               <button
                 onClick={handleEditClick}
                 className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
               >
                 <Edit className="w-4 h-4 mr-2" />
                 Contribute to this page
               </button>
             </div>
           </div>
         </div>
       )}

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

                                           {/* Related notions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Related notions ({relatedVertices.length})</h3>
              {relatedVertices.length > 0 ? (
                <div className="space-y-3">
                  {relatedVertices.map((relatedVertex) => (
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
                  <p className="text-gray-500 font-medium">No related notions found</p>
                </div>
              )}
            </div>
         </div>
       </div>

        {/* Edit Button - Always Visible */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleEditClick}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Primitive
          </button>
        </div>

        {/* Edit Section - Collapsible */}
        {showEditSection && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50" ref={editSectionRef}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Edit Primitive</h2>
              {isEditing && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {currentUser?.role === 'admin' ? 'Save' : 'Submit'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

         {isEditing ? (
           <div className="mt-6 space-y-6">
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
                  value={editForm.tags_raw || (Array.isArray(editForm.tags) ? editForm.tags.join(', ') : '')}
                  onChange={(e) => handleInputChange('tags_raw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">Description</label>
                 <button
                   type="button"
                   onClick={() => setPreviewDescription(!previewDescription)}
                   className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                 >
                   {previewDescription ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                   {previewDescription ? 'Back to Edit' : 'Preview'}
                 </button>
               </div>
               {previewDescription ? (
                 <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[72px]">
                   <LatexRenderer content={editForm.description || ''} />
                 </div>
               ) : (
                 <textarea
                   value={editForm.description || ''}
                   onChange={(e) => handleInputChange('description', e.target.value)}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter description"
                 />
               )}
             </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">Definition</label>
                 <button
                   type="button"
                   onClick={() => setPreviewDefinition(!previewDefinition)}
                   className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                 >
                   {previewDefinition ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                   {previewDefinition ? 'Back to Edit' : 'Preview'}
                 </button>
               </div>
               {previewDefinition ? (
                 <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[144px]">
                   <LatexRenderer content={editForm.definition || ''} />
                 </div>
               ) : (
                 <textarea
                   value={editForm.definition || ''}
                   onChange={(e) => handleInputChange('definition', e.target.value)}
                   rows={6}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter mathematical definition"
                 />
               )}
             </div>

                                        <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">Notes</label>
                 <button
                   type="button"
                   onClick={() => setPreviewNotes(!previewNotes)}
                   className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                 >
                   {previewNotes ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                   {previewNotes ? 'Back to Edit' : 'Preview'}
                 </button>
               </div>
               {previewNotes ? (
                 <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[72px]">
                   <LatexRenderer content={editForm.notes || ''} />
                 </div>
               ) : (
                 <textarea
                   value={editForm.notes || ''}
                   onChange={(e) => handleInputChange('notes', e.target.value)}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter additional notes"
                 />
               )}
             </div>

                           <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Related Vertices (comma-separated IDs)</label>
                <input
                  type="text"
                  value={editForm.related_vertices_raw || (Array.isArray(editForm.related_vertices) ? editForm.related_vertices.join(', ') : '')}
                  onChange={(e) => handleInputChange('related_vertices_raw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter related vertex IDs separated by commas"
                />
              </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">References</label>
                 <button 
                   type="button" 
                   className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium hover:bg-primary-200 transition-colors" 
                   onClick={addReference}
                 >
                   + Add Reference
                 </button>
               </div>
               {(editForm.references_data || []).map((ref, idx) => (
                 <div key={idx} className="flex flex-wrap gap-2 items-center border border-gray-200 rounded p-2 mb-2">
                   <input 
                     className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" 
                     placeholder="title" 
                     value={ref.title} 
                     onChange={e => handleReferenceChange(idx, 'title', e.target.value)} 
                   />
                   <input 
                     className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" 
                     placeholder="author" 
                     value={ref.author} 
                     onChange={e => handleReferenceChange(idx, 'author', e.target.value)} 
                   />
                   <input 
                     className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" 
                     type="number" 
                     placeholder="year" 
                     value={ref.year} 
                     onChange={e => handleReferenceChange(idx, 'year', Number(e.target.value))} 
                   />
                   <input 
                     className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" 
                     placeholder="url" 
                     value={ref.url} 
                     onChange={e => handleReferenceChange(idx, 'url', e.target.value)} 
                   />
                   <button 
                     type="button" 
                     className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors w-8 h-8 flex items-center justify-center" 
                     onClick={() => removeReference(idx)}
                   >
                     -
                   </button>
                   <button 
                     type="button" 
                     className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors w-8 h-8 flex items-center justify-center" 
                     onClick={() => moveReferenceUp(idx)}
                   >
                     <ArrowUp className="w-4 h-4" />
                   </button>
                   <button 
                     type="button" 
                     className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors w-8 h-8 flex items-center justify-center" 
                     onClick={() => moveReferenceDown(idx)}
                   >
                     <ArrowDown className="w-4 h-4" />
                   </button>
                 </div>
               ))}
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
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (for notifications) <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        emailError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {emailError && (
                      <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                  </div>
                </>
              )}

              {/* Comments for reviewers - for non-admin users */}
              {currentUser?.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments for Reviewers</label>
                  <textarea
                    value={reviewerComments}
                    onChange={(e) => setReviewerComments(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add any additional comments or context for the reviewers..."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4 text-sm">
              Click the Edit button to modify this primitive
            </div>
          )}
        </div>
      </div>
        )}

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