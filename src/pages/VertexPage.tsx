import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight } from 'lucide-react';
import { cryptoDataService } from '../services/cryptoDataService';
import LatexRenderer from '../components/LatexRenderer';

export default function VertexPage() {
  const { id } = useParams<{ id: string }>();
  const vertex = id ? cryptoDataService.getVertexById(id) : undefined;
  const { incoming, outgoing } = vertex && id ? cryptoDataService.getRelatedVertices(id) : { incoming: [], outgoing: [] };
  const { incoming: incomingEdges, outgoing: outgoingEdges } = vertex && id ? cryptoDataService.getEdgesForVertex(id) : { incoming: [], outgoing: [] };

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
          <h1 className="text-3xl font-bold text-gray-900">{vertex.name}</h1>
          <p className="text-xl text-gray-600">{vertex.abbreviation}</p>
        </div>
        <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full capitalize">
          {vertex.category}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Definition */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Definition</h2>
            <p className="text-gray-700 leading-relaxed">
              <LatexRenderer content={vertex.definition} />
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              <LatexRenderer content={vertex.description} />
            </p>
          </div>

          {/* References */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">References</h2>
            <div className="space-y-3">
              {vertex.references.map((ref, index) => (
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

        {/* Right Column - Relationships */}
        <div className="space-y-6">
          {/* Incoming Relationships */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Implied by ({incoming.length})
            </h3>
            {incoming.length > 0 ? (
              <div className="space-y-2">
                {incoming.map((relatedVertex) => (
                  <Link
                    key={relatedVertex.id}
                    to={`/vertex/${relatedVertex.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{relatedVertex.name}</div>
                        <div className="text-sm text-gray-500">{relatedVertex.abbreviation}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No incoming relationships</p>
            )}
          </div>

          {/* Outgoing Relationships */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Implies ({outgoing.length})
            </h3>
            {outgoing.length > 0 ? (
              <div className="space-y-2">
                {outgoing.map((relatedVertex) => (
                  <Link
                    key={relatedVertex.id}
                    to={`/vertex/${relatedVertex.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{relatedVertex.name}</div>
                        <div className="text-sm text-gray-500">{relatedVertex.abbreviation}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No outgoing relationships</p>
            )}
          </div>

          {/* Related Constructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Related Constructions ({incomingEdges.length + outgoingEdges.length})
            </h3>
            <div className="space-y-2">
              {[...incomingEdges, ...outgoingEdges].map((edge) => (
                <Link
                  key={edge.id}
                  to={`/edge/${edge.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{edge.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{edge.type}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 