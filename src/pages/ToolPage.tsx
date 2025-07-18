import { useState, useEffect } from 'react';

interface Reference {
  title: string;
  author: string;
  year: number;
  url: string;
}

interface VertexForm {
  id: string;
  name: string;
  abbreviation: string;
  type: string;
  tags: string[];
  description: string;
  definition: string;
  references: Reference[];
  relatedVertices: string[];
  notes: string;
}

interface EdgeForm {
  id: string;
  type: string;
  name: string;
  description: string;
  overview: string;
  sourceVertices: string[];
  targetVertices: string[];
  tags: string[];
  model: string;
  references: Reference[];
  notes: string;
}

const vertexTemplate: VertexForm = {
  id: '',
  name: '',
  abbreviation: '',
  type: '',
  tags: [],
  description: '',
  definition: '',
  references: [],
  relatedVertices: [],
  notes: ''
};

const edgeTemplate: EdgeForm = {
  id: '',
  type: '',
  name: '',
  description: '',
  overview: '',
  sourceVertices: [],
  targetVertices: [],
  tags: [],
  model: '',
  references: [],
  notes: ''
};

function prettyJson(obj: object) {
  return JSON.stringify(obj, null, 2);
}

export default function ToolPage() {
  const [mode, setMode] = useState<'vertex' | 'edge'>('vertex');
  const [vertex, setVertex] = useState<VertexForm>({ ...vertexTemplate });
  const [edge, setEdge] = useState<EdgeForm>({ ...edgeTemplate });
  const [copySuccess, setCopySuccess] = useState(false);

  // Local string states for comma separated fields
  const [vertexTagsInput, setVertexTagsInput] = useState('');
  const [vertexRelatedInput, setVertexRelatedInput] = useState('');
  const [edgeTagsInput, setEdgeTagsInput] = useState('');
  const [edgeSourceInput, setEdgeSourceInput] = useState('');
  const [edgeTargetInput, setEdgeTargetInput] = useState('');

  // Sync local string state with array state when switching mode or resetting
  useEffect(() => {
    setVertexTagsInput(vertex.tags.join(', '));
    setVertexRelatedInput(vertex.relatedVertices.join(', '));
  }, [vertex]);
  useEffect(() => {
    setEdgeTagsInput(edge.tags.join(', '));
    setEdgeSourceInput(edge.sourceVertices.join(', '));
    setEdgeTargetInput(edge.targetVertices.join(', '));
  }, [edge]);

  // Handlers for updating array state from string input
  const handleVertexTagsBlur = () => {
    setVertex(v => ({ ...v, tags: vertexTagsInput.split(',').map(s => s.trim()).filter(Boolean) }));
  };
  const handleVertexRelatedBlur = () => {
    setVertex(v => ({ ...v, relatedVertices: vertexRelatedInput.split(',').map(s => s.trim()).filter(Boolean) }));
  };
  const handleEdgeTagsBlur = () => {
    setEdge(e => ({ ...e, tags: edgeTagsInput.split(',').map(s => s.trim()).filter(Boolean) }));
  };
  const handleEdgeSourceBlur = () => {
    setEdge(e => ({ ...e, sourceVertices: edgeSourceInput.split(',').map(s => s.trim()).filter(Boolean) }));
  };
  const handleEdgeTargetBlur = () => {
    setEdge(e => ({ ...e, targetVertices: edgeTargetInput.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleVertexChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVertex(v => ({ ...v, [name]: value }));
  };

  const handleEdgeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEdge(ed => ({ ...ed, [name]: value }));
  };

  const handleVertexTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVertex(v => ({ ...v, type: e.target.value }));
  };
  const handleEdgeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEdge(ed => ({ ...ed, type: e.target.value }));
  };

  const handleCopy = () => {
    const text = mode === 'vertex' ? prettyJson(vertex) : prettyJson(edge);
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  };

  const handleVertexReferenceChange = (idx: number, field: keyof Reference, value: string | number) => {
    setVertex(v => ({
      ...v,
      references: v.references.map((ref, i) => i === idx ? { ...ref, [field]: value } : ref)
    }));
  };
  const addVertexReference = () => {
    setVertex(v => ({ ...v, references: [...v.references, { title: '', author: '', year: new Date().getFullYear(), url: '' }] }));
  };
  const removeVertexReference = (idx: number) => {
    setVertex(v => ({ ...v, references: v.references.filter((_, i) => i !== idx) }));
  };

  const handleEdgeReferenceChange = (idx: number, field: keyof Reference, value: string | number) => {
    setEdge(e => ({
      ...e,
      references: e.references.map((ref, i) => i === idx ? { ...ref, [field]: value } : ref)
    }));
  };
  const addEdgeReference = () => {
    setEdge(e => ({ ...e, references: [...e.references, { title: '', author: '', year: new Date().getFullYear(), url: '' }] }));
  };
  const removeEdgeReference = (idx: number) => {
    setEdge(e => ({ ...e, references: e.references.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Vertex/Edge JSON Generator</h1>
      <div className="mb-6">
        <label className="mr-4 font-medium">
          <input type="radio" checked={mode === 'vertex'} onChange={() => setMode('vertex')} /> Vertex
        </label>
        <label className="font-medium">
          <input type="radio" checked={mode === 'edge'} onChange={() => setMode('edge')} /> Edge
        </label>
      </div>
      {mode === 'vertex' ? (
        <form className="space-y-6 bg-white/80 rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-primary-700">Vertex Fields</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input className="input w-full" name="id" placeholder="e.g. owf" value={vertex.id} onChange={handleVertexChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="input w-full" name="name" placeholder="e.g. One-Way Function" value={vertex.name} onChange={handleVertexChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation</label>
              <input className="input w-full" name="abbreviation" placeholder="e.g. OWF" value={vertex.abbreviation} onChange={handleVertexChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input w-full" name="type" value={vertex.type} onChange={handleVertexTypeChange}>
                <option value="">Select type</option>
                <option value="primitive">primitive</option>
                <option value="assumption">assumption</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400">(comma separated)</span></label>
              <input className="input w-full" name="tags" placeholder="e.g. symmetric, foundational" value={vertexTagsInput} onChange={e => setVertexTagsInput(e.target.value)} onBlur={handleVertexTagsBlur} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Vertices <span className="text-gray-400">(IDs, comma separated)</span></label>
              <input className="input w-full" name="relatedVertices" placeholder="e.g. prg, prf" value={vertexRelatedInput} onChange={e => setVertexRelatedInput(e.target.value)} onBlur={handleVertexRelatedBlur} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(short, one line)</span></label>
            <textarea className="input w-full" name="description" placeholder="A function that is easy to compute on every input, but hard to invert..." value={vertex.description} onChange={handleVertexChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Definition <span className="text-gray-400">(formal, can use LaTeX)</span></label>
            <textarea className="input w-full" name="definition" placeholder="Formal definition, e.g. One-way functions are fundamental building blocks..." value={vertex.definition} onChange={handleVertexChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea className="input w-full" name="notes" placeholder="Additional notes or comments..." value={vertex.notes} onChange={handleVertexChange} />
          </div>
          {/* References section for vertex */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">References</span>
              <button type="button" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium" onClick={addVertexReference}>+ Add Reference</button>
            </div>
            {vertex.references.map((ref, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-center border border-gray-200 rounded p-2 mb-1">
                <input className="input flex-1" placeholder="title" value={ref.title} onChange={e => handleVertexReferenceChange(idx, 'title', e.target.value)} />
                <input className="input flex-1" placeholder="author" value={ref.author} onChange={e => handleVertexReferenceChange(idx, 'author', e.target.value)} />
                <input className="input w-20" type="number" placeholder="year" value={ref.year} onChange={e => handleVertexReferenceChange(idx, 'year', Number(e.target.value))} />
                <input className="input flex-1" placeholder="url" value={ref.url} onChange={e => handleVertexReferenceChange(idx, 'url', e.target.value)} />
                <button type="button" className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium" onClick={() => removeVertexReference(idx)}>-</button>
              </div>
            ))}
          </div>
        </form>
      ) : (
        <form className="space-y-6 bg-white/80 rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-primary-700">Edge Fields</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input className="input w-full" name="id" placeholder="e.g. owf-to-prg" value={edge.id} onChange={handleEdgeChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input w-full" name="type" value={edge.type} onChange={handleEdgeTypeChange}>
                <option value="">Select type</option>
                <option value="construction">construction</option>
                <option value="impossibility">impossibility</option>
                <option value="reduction">reduction</option>
                <option value="separation">separation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select className="input w-full" name="model" value={edge.model} onChange={handleEdgeChange}>
                <option value="">Select model</option>
                <option value="plain">plain</option>
                <option value="random oracle">random oracle</option>
                <option value="common reference string">common reference string</option>
                <option value="bounded storage">bounded storage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="input w-full" name="name" placeholder="e.g. OWF to PRG Construction" value={edge.name} onChange={handleEdgeChange} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400">(comma separated)</span></label>
              <input className="input w-full" name="tags" placeholder="e.g. symmetric, foundational" value={edgeTagsInput} onChange={e => setEdgeTagsInput(e.target.value)} onBlur={handleEdgeTagsBlur} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Vertices <span className="text-gray-400">(IDs, comma separated)</span></label>
              <input className="input w-full" name="sourceVertices" placeholder="e.g. owf" value={edgeSourceInput} onChange={e => setEdgeSourceInput(e.target.value)} onBlur={handleEdgeSourceBlur} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Vertices <span className="text-gray-400">(IDs, comma separated)</span></label>
              <input className="input w-full" name="targetVertices" placeholder="e.g. prg" value={edgeTargetInput} onChange={e => setEdgeTargetInput(e.target.value)} onBlur={handleEdgeTargetBlur} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(short, one line)</span></label>
            <textarea className="input w-full" name="description" placeholder="A one-way function can be used to construct a pseudorandom generator..." value={edge.description} onChange={handleEdgeChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overview <span className="text-gray-400">(formal, can use LaTeX)</span></label>
            <textarea className="input w-full" name="overview" placeholder="Formal overview, e.g. The Goldreich-Levin construction..." value={edge.overview} onChange={handleEdgeChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea className="input w-full" name="notes" placeholder="Additional notes or comments..." value={edge.notes} onChange={handleEdgeChange} />
          </div>
          {/* References section for edge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">References</span>
              <button type="button" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium" onClick={addEdgeReference}>+ Add Reference</button>
            </div>
            {edge.references.map((ref, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-center border border-gray-200 rounded p-2 mb-1">
                <input className="input flex-1" placeholder="title" value={ref.title} onChange={e => handleEdgeReferenceChange(idx, 'title', e.target.value)} />
                <input className="input flex-1" placeholder="author" value={ref.author} onChange={e => handleEdgeReferenceChange(idx, 'author', e.target.value)} />
                <input className="input w-20" type="number" placeholder="year" value={ref.year} onChange={e => handleEdgeReferenceChange(idx, 'year', Number(e.target.value))} />
                <input className="input flex-1" placeholder="url" value={ref.url} onChange={e => handleEdgeReferenceChange(idx, 'url', e.target.value)} />
                <button type="button" className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium" onClick={() => removeEdgeReference(idx)}>-</button>
              </div>
            ))}
          </div>
        </form>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Generated JSON</h2>
        <pre className="bg-gray-100 rounded p-4 text-sm overflow-x-auto border border-gray-200">
          {mode === 'vertex' ? prettyJson(vertex) : prettyJson(edge)}
        </pre>
        <button
          type="button"
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors font-medium"
          onClick={handleCopy}
        >
          Copy JSON
        </button>
        {copySuccess && <span className="ml-4 text-green-600 font-medium">Copied!</span>}
      </div>
    </div>
  );
}

// Tailwind input style
// .input { @apply border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200; } 