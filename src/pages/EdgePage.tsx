import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight, Edit, Save, X, AlertTriangle, ArrowUp, ArrowDown, Eye, Edit3 } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import LatexRenderer from '../components/LatexRenderer';
import { useState, useEffect, useRef } from 'react';
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
  const [showEditSection, setShowEditSection] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Edge> & { tags_raw?: string; source_vertices_raw?: string; target_vertices_raw?: string }>({});
  const [email, setEmail] = useState('');
  const [reviewerComments, setReviewerComments] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [emailError, setEmailError] = useState('');
  const editSectionRef = useRef<HTMLDivElement>(null);
  
  // Preview state for different fields
  const [previewOverview, setPreviewOverview] = useState(false);
  const [previewTheorem, setPreviewTheorem] = useState(false);
  const [previewConstruction, setPreviewConstruction] = useState(false);
  const [previewProofSketch, setPreviewProofSketch] = useState(false);
  const [previewNotes, setPreviewNotes] = useState(false);

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
        tags_raw: Array.isArray(edge.tags) ? edge.tags.join(', ') : '',
        source_vertices: edge.source_vertices || [],
        source_vertices_raw: Array.isArray(edge.source_vertices) ? edge.source_vertices.join(', ') : '',
        target_vertices: edge.target_vertices || [],
        target_vertices_raw: Array.isArray(edge.target_vertices) ? edge.target_vertices.join(', ') : '',
        references_data: edge.references_data || [],
        wip: edge.wip || false
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
      // Process raw strings into arrays
      const processedForm = { ...editForm };
      if (editForm.tags_raw !== undefined) {
        processedForm.tags = editForm.tags_raw.split(',').map(tag => tag.trim()).filter(tag => tag);
        delete processedForm.tags_raw;
      }
      if (editForm.source_vertices_raw !== undefined) {
        processedForm.source_vertices = editForm.source_vertices_raw.split(',').map(id => id.trim()).filter(id => id);
        delete processedForm.source_vertices_raw;
      }
      if (editForm.target_vertices_raw !== undefined) {
        processedForm.target_vertices = editForm.target_vertices_raw.split(',').map(id => id.trim()).filter(id => id);
        delete processedForm.target_vertices_raw;
      }
      
      const updatedEdge = await supabaseService.updateEdge(id, processedForm);
      setEdge(updatedEdge);
      setIsEditing(false);
      setShowEditSection(false);
      setEditForm({});
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Failed to update edge:', err);
    }
  };

  const handleSubmitEditRequest = async () => {
    if (!edge || !id) return;
    
    // Validate email for non-logged in users
    if (!currentUser && !email.trim()) {
      setEmailError('Email is required for non-logged in users');
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
      if (editForm.source_vertices_raw !== undefined) {
        processedForm.source_vertices = editForm.source_vertices_raw.split(',').map(id => id.trim()).filter(id => id);
        delete processedForm.source_vertices_raw;
      }
      if (editForm.target_vertices_raw !== undefined) {
        processedForm.target_vertices = editForm.target_vertices_raw.split(',').map(id => id.trim()).filter(id => id);
        delete processedForm.target_vertices_raw;
      }
      
      const editRequest = {
        type: 'edge' as const,
        target_id: id,
        data: processedForm,
        action: 'update' as const,
        notes: `Edit request for edge ${edge.name}${reviewerComments ? `\n\nReviewer Comments: ${reviewerComments}` : ''}`,
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

  const handleInputChange = (field: keyof Edge | 'tags_raw' | 'source_vertices_raw' | 'target_vertices_raw', value: string | string[] | boolean | Reference[]) => {
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

       {/* WIP Warning */}
       {edge.wip && (
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
                 This cryptographic construction is currently under development. The information may be incomplete or subject to change.
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

        {/* Edit Button - Always Visible */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleEditClick}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Construction
          </button>
        </div>

        {/* Edit Section - Collapsible */}
        {showEditSection && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50" ref={editSectionRef}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Edit Construction</h2>
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
                  value={editForm.tags_raw || (Array.isArray(editForm.tags) ? editForm.tags.join(', ') : '')}
                  onChange={(e) => handleInputChange('tags_raw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">Overview</label>
                 <button
                   type="button"
                   onClick={() => setPreviewOverview(!previewOverview)}
                   className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                 >
                   {previewOverview ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                   {previewOverview ? 'Back to Edit' : 'Preview'}
                 </button>
               </div>
               {previewOverview ? (
                 <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[96px]">
                   <LatexRenderer content={editForm.overview || ''} />
                 </div>
               ) : (
                 <textarea
                   value={editForm.overview || ''}
                   onChange={(e) => handleInputChange('overview', e.target.value)}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter overview"
                 />
               )}
             </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">Theorem</label>
                 <button
                   type="button"
                   onClick={() => setPreviewTheorem(!previewTheorem)}
                   className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                 >
                   {previewTheorem ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                   {previewTheorem ? 'Back to Edit' : 'Preview'}
                 </button>
               </div>
               {previewTheorem ? (
                 <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[96px]">
                   <LatexRenderer content={editForm.theorem || ''} />
                 </div>
               ) : (
                 <textarea
                   value={editForm.theorem || ''}
                   onChange={(e) => handleInputChange('theorem', e.target.value)}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter theorem statement"
                 />
               )}
             </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">Construction</label>
                 <button
                   type="button"
                   onClick={() => setPreviewConstruction(!previewConstruction)}
                   className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                 >
                   {previewConstruction ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                   {previewConstruction ? 'Back to Edit' : 'Preview'}
                 </button>
               </div>
               {previewConstruction ? (
                 <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[144px]">
                   <LatexRenderer content={editForm.construction || ''} />
                 </div>
               ) : (
                 <textarea
                   value={editForm.construction || ''}
                   onChange={(e) => handleInputChange('construction', e.target.value)}
                   rows={6}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter construction details"
                 />
               )}
             </div>

             <div>
               <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-medium text-gray-700">Proof Sketch</label>
                 <button
                   type="button"
                   onClick={() => setPreviewProofSketch(!previewProofSketch)}
                   className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                 >
                   {previewProofSketch ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                   {previewProofSketch ? 'Back to Edit' : 'Preview'}
                 </button>
               </div>
               {previewProofSketch ? (
                 <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[144px]">
                   <LatexRenderer content={editForm.proof_sketch || ''} />
                 </div>
               ) : (
                 <textarea
                   value={editForm.proof_sketch || ''}
                   onChange={(e) => handleInputChange('proof_sketch', e.target.value)}
                   rows={6}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                   placeholder="Enter proof sketch"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Vertices (comma-separated IDs)</label>
                <input
                  type="text"
                  value={editForm.source_vertices_raw || (Array.isArray(editForm.source_vertices) ? editForm.source_vertices.join(', ') : '')}
                  onChange={(e) => handleInputChange('source_vertices_raw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter source vertex IDs separated by commas"
                />
              </div>

                           <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Vertices (comma-separated IDs)</label>
                <input
                  type="text"
                  value={editForm.target_vertices_raw || (Array.isArray(editForm.target_vertices) ? editForm.target_vertices.join(', ') : '')}
                  onChange={(e) => handleInputChange('target_vertices_raw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter target vertex IDs separated by commas"
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
              Click the Edit button to modify this construction
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