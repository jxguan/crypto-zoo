import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { cryptoDataService } from '../services/cryptoDataService';
import LatexRenderer from '../components/LatexRenderer';

interface SearchPageProps {
  query: string;
}

export default function SearchPage({ query }: SearchPageProps) {
  const vertexResults = cryptoDataService.searchVertices(query);
  const edgeResults = cryptoDataService.searchEdges(query);
  const totalResults = vertexResults.length + edgeResults.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Results</h1>
        <p className="text-xl text-gray-600">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>

      {/* Search Results */}
      <div className="space-y-8">
        {/* Primitives Results */}
        {vertexResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Primitives ({vertexResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vertexResults.map((vertex) => (
                <div key={vertex.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vertex.name}</h3>
                      <p className="text-sm text-gray-500">{vertex.abbreviation}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full capitalize">
                      {vertex.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    <LatexRenderer content={vertex.definition} />
                  </p>
                  <Link
                    to={`/vertex/${vertex.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    View details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constructions Results */}
        {edgeResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Constructions ({edgeResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {edgeResults.map((edge) => (
                <div key={edge.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{edge.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{edge.type}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full capitalize">
                      {edge.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    <LatexRenderer content={edge.description} />
                  </p>
                  <Link
                    to={`/edge/${edge.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    View details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {totalResults === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No results found</h2>
            <p className="text-gray-600 mb-6">
              Try searching for different terms or browse our collection of cryptographic primitives.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse All Primitives
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 