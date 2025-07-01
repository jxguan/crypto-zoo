import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight } from 'lucide-react';
import { cryptoDataService } from '../services/cryptoDataService';
import LatexRenderer from '../components/LatexRenderer';

export default function EdgePage() {
  const { id } = useParams<{ id: string }>();
  const edge = id ? cryptoDataService.getEdgeById(id) : undefined;

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

  const sourceVertices = edge.sourceVertices.map(id => cryptoDataService.getVertexById(id)).filter((v): v is NonNullable<typeof v> => v !== undefined);
  const targetVertices = edge.targetVertices.map(id => cryptoDataService.getVertexById(id)).filter((v): v is NonNullable<typeof v> => v !== undefined);

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
          {edge.category}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              <LatexRenderer content={edge.description} />
            </p>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              <LatexRenderer content={edge.overview} />
            </p>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {edge.complexity && (
                <div>
                  <div className="font-medium text-gray-900">Complexity</div>
                  <div className="text-gray-600">{edge.complexity}</div>
                </div>
              )}
              {edge.security && (
                <div>
                  <div className="font-medium text-gray-900">Security</div>
                  <div className="text-gray-600">{edge.security}</div>
                </div>
              )}
            </div>
          </div>

          {/* References */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">References</h2>
            <div className="space-y-3">
              {edge.references.map((ref, index) => (
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
                  to={`/vertex/${vertex.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                  to={`/vertex/${vertex.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
    </div>
  );
} 