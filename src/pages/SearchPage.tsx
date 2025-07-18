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
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-3xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Results</h1>
          <p className="text-xl text-gray-600">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-12">
        {/* Primitives Results */}
        {vertexResults.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Primitives ({vertexResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vertexResults.map((vertex, index) => (
                <div key={vertex.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{vertex.name}</h3>
                      <p className="text-sm text-gray-500 font-mono mb-3">{vertex.abbreviation}</p>
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-full capitalize">
                        {vertex.type}
                      </span>
                      <span className="inline-block px-2 py-1 ml-2 text-xs font-medium bg-gray-100 text-gray-500 rounded capitalize">
                        {vertex.tags && vertex.tags.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    <LatexRenderer content={vertex.definition} />
                  </div>
                  <Link
                    to={`/v/${vertex.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors font-semibold group-hover:underline"
                  >
                    View details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constructions Results */}
        {edgeResults.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Constructions ({edgeResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {edgeResults.map((edge, index) => (
                <div key={edge.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{edge.name}</h3>
                      <p className="text-sm text-gray-500 capitalize font-medium mb-3">{edge.type}</p>
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 rounded-full capitalize">
                        {edge.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    <LatexRenderer content={edge.description} />
                  </div>
                  <Link
                    to={`/edge/${edge.id}`}
                    className="inline-flex items-center text-accent-600 hover:text-accent-700 transition-colors font-semibold group-hover:underline"
                  >
                    View details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {totalResults === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-2xl mx-auto">
              <Search className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No results found</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Try searching for different terms or browse our collection of cryptographic primitives.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
              >
                Browse All Primitives
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 