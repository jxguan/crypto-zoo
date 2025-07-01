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
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-3xl p-8">
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">{vertex.name}</h1>
              <span className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-full capitalize">
                {vertex.category}
              </span>
            </div>
            <p className="text-2xl text-gray-600 font-mono">{vertex.abbreviation}</p>
          </div>
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

          {/* Description */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
                <span className="text-accent-600 font-bold">i</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Description</h2>
            </div>
            <div className="text-gray-700 leading-relaxed text-lg">
              <LatexRenderer content={vertex.description} />
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
              {vertex.references.map((ref, index) => (
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
          {/* Incoming Relationships */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">←</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Implied by ({incoming.length})
              </h3>
            </div>
            {incoming.length > 0 ? (
              <div className="space-y-3">
                {incoming.map((relatedVertex) => (
                  <Link
                    key={relatedVertex.id}
                    to={`/vertex/${relatedVertex.id}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 group"
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
                <p className="text-gray-500 font-medium">No incoming relationships</p>
              </div>
            )}
          </div>

          {/* Outgoing Relationships */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">→</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Implies ({outgoing.length})
              </h3>
            </div>
            {outgoing.length > 0 ? (
              <div className="space-y-3">
                {outgoing.map((relatedVertex) => (
                  <Link
                    key={relatedVertex.id}
                    to={`/vertex/${relatedVertex.id}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-all duration-200 group"
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
                <p className="text-gray-500 font-medium">No outgoing relationships</p>
              </div>
            )}
          </div>

          {/* Related Constructions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Related Constructions ({incomingEdges.length + outgoingEdges.length})
              </h3>
            </div>
            <div className="space-y-3">
              {[...incomingEdges, ...outgoingEdges].map((edge) => (
                <Link
                  key={edge.id}
                  to={`/edge/${edge.id}`}
                  className="block p-4 border border-gray-200 rounded-xl hover:bg-accent-50 hover:border-accent-200 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-accent-600 transition-colors">
                        {edge.name}
                      </div>
                      <div className="text-sm text-gray-500 capitalize font-medium">{edge.type}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent-500 transition-colors" />
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