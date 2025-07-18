import { Link } from 'react-router-dom';
import { cryptoDataService } from '../services/cryptoDataService';
import { ArrowRight } from 'lucide-react';

export default function GraphView() {
  const vertices = cryptoDataService.getAllVertices();
  const edges = cryptoDataService.getAllEdges();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Graph View</h1>
        <p className="text-xl text-gray-600">
          Interactive visualization of cryptographic primitives and their relationships
        </p>
      </div>

      {/* Placeholder for future graph visualization */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Interactive Graph Visualization
        </h2>
        <p className="text-gray-600 mb-6">
          This will be an interactive D3.js visualization showing the relationships between 
          cryptographic primitives. Users will be able to zoom, pan, and click on nodes 
          to explore the connections.
        </p>
        <div className="text-sm text-gray-500">
          Coming soon: Interactive force-directed graph with zoom, pan, and node interactions
        </div>
      </div>

      {/* Quick overview of relationships */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primitives ({vertices.length})</h3>
            <div className="space-y-2">
              {vertices.map((vertex) => (
                <Link
                  key={vertex.id}
                  to={`/v/${vertex.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{vertex.name}</div>
                      <div className="text-sm text-gray-500">{vertex.abbreviation}</div>
                      <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded capitalize">
                        {vertex.type}
                      </span>
                      {vertex.tags && vertex.tags.length > 0 && (
                        <span className="ml-2 space-x-1">
                          {vertex.tags.map((tag) => (
                            <span key={tag} className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded capitalize">{tag}</span>
                          ))}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationships ({edges.length})</h3>
            <div className="space-y-2">
              {edges.map((edge) => (
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