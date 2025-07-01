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
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
        <div className="relative text-center space-y-8 py-16">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Welcome to the{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Crypto Zoo
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Explore the fascinating world of cryptographic primitives and their relationships. 
              Discover how different cryptographic building blocks connect and build upon each other.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              to="/graph"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              <Network className="w-6 h-6 mr-3" />
              Explore Graph View
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 font-semibold text-lg"
            >
              <Search className="w-6 h-6 mr-3" />
              Search Primitives
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all duration-300 group">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
            {vertices.length}
          </div>
          <div className="text-gray-600 font-medium">Cryptographic Primitives</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all duration-300 group">
          <div className="text-4xl font-bold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent mb-2">
            {edges.length}
          </div>
          <div className="text-gray-600 font-medium">Relationships & Constructions</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 text-center hover:shadow-xl transition-all duration-300 group">
          <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent mb-2">
            {Object.keys(categories).length}
          </div>
          <div className="text-gray-600 font-medium">Categories</div>
        </div>
      </div>

            {/* Categories */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse cryptographic primitives organized by their fundamental properties and applications
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(categories).map(([category, primitives], index) => (
            <div key={category} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 capitalize">
                    {category.replace('-', ' ')}
                  </h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">{primitives.length}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 font-medium">
                  {primitives.length} primitive{primitives.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-3">
                  {primitives.slice(0, 3).map((primitive) => (
                    <Link
                      key={primitive.id}
                      to={`/vertex/${primitive.id}`}
                      className="block p-3 rounded-xl hover:bg-primary-50 transition-all duration-200 group/item"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 group-hover/item:text-primary-600 transition-colors">
                            {primitive.name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">{primitive.abbreviation}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover/item:text-primary-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                  {primitives.length > 3 && (
                    <div className="text-gray-500 text-sm font-medium pt-2">
                      +{primitives.length - 3} more primitives...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Primitives */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Primitives</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the fundamental building blocks of modern cryptography
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vertices.slice(0, 6).map((vertex, index) => (
            <div key={vertex.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 hover:shadow-xl transition-all duration-300 group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{vertex.name}</h3>
                  <p className="text-sm text-gray-500 font-mono mb-3">{vertex.abbreviation}</p>
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 rounded-full capitalize">
                    {vertex.category}
                  </span>
                </div>
              </div>
              <div className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                <LatexRenderer content={vertex.definition} />
              </div>
              <Link
                to={`/vertex/${vertex.id}`}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors font-semibold group-hover:underline"
              >
                Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 