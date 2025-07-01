import { Link } from 'react-router-dom';
import { Network, Search, ArrowRight } from 'lucide-react';
import { cryptoDataService } from '../services/cryptoDataService';
import LatexRenderer from '../components/LatexRenderer';

export default function HomePage() {
  const vertices = cryptoDataService.getAllVertices();
  const edges = cryptoDataService.getAllEdges();

  const categories = {
    foundational: vertices.filter(v => v.category === 'foundational'),
    symmetric: vertices.filter(v => v.category === 'symmetric'),
    asymmetric: vertices.filter(v => v.category === 'asymmetric'),
    quantum: vertices.filter(v => v.category === 'quantum'),
    'post-quantum': vertices.filter(v => v.category === 'post-quantum'),
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Welcome to the{' '}
          <span className="text-primary-600">Crypto Zoo</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore the fascinating world of cryptographic primitives and their relationships. 
          Discover how different cryptographic building blocks connect and build upon each other.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/graph"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Network className="w-5 h-5 mr-2" />
            Explore Graph View
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Primitives
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-primary-600">{vertices.length}</div>
          <div className="text-gray-600">Cryptographic Primitives</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-primary-600">{edges.length}</div>
          <div className="text-gray-600">Relationships & Constructions</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="text-3xl font-bold text-primary-600">{Object.keys(categories).length}</div>
          <div className="text-gray-600">Categories</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Explore by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categories).map(([category, primitives]) => (
            <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 capitalize mb-2">
                  {category.replace('-', ' ')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {primitives.length} primitive{primitives.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {primitives.slice(0, 3).map((primitive) => (
                    <Link
                      key={primitive.id}
                      to={`/vertex/${primitive.id}`}
                      className="block text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {primitive.name} ({primitive.abbreviation})
                    </Link>
                  ))}
                  {primitives.length > 3 && (
                    <div className="text-gray-500 text-sm">
                      +{primitives.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Primitives */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Featured Primitives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vertices.slice(0, 6).map((vertex) => (
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
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 