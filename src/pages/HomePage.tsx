import { Link } from 'react-router-dom';
import { Network, Search, ArrowRight } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import LatexRenderer from '../components/LatexRenderer';
import { useState, useEffect } from 'react';
import type { Vertex, Edge } from '../types/crypto';

export default function HomePage() {
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [verticesData, edgesData] = await Promise.all([
          supabaseService.getAllVertices(),
          supabaseService.getAllEdges()
        ]);
        setVertices(verticesData);
        setEdges(edgesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setVertices([]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Group by type instead of category
  const types = Array.from(new Set(vertices.map(v => v.type)));
  const groupedByType = Object.fromEntries(
    types.map(type => [type, vertices.filter(v => v.type === type)])
  );

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
          <div className="text-red-500 mb-4">Error loading data</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

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
            {Object.keys(groupedByType).length}
          </div>
          <div className="text-gray-600 font-medium">Types</div>
        </div>
      </div>

            {/* Types Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore by Type</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse cryptographic objects organized by their type (primitive, assumption, etc.)
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(groupedByType).map(([type, group], index) => (
          <div key={type} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 capitalize">{type}</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-lg">{group.length}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-6 font-medium">
                {group.length} object{group.length !== 1 ? 's' : ''}
              </p>
              {group.slice(0, 3).map((vertex) => (
                <Link
                  key={vertex.id}
                  to={`/v/${vertex.id}`}
                  className="block p-3 rounded-xl hover:bg-primary-50 transition-all duration-200 group/item"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 group-hover/item:text-primary-600 transition-colors">
                        {vertex.name}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{vertex.abbreviation}</div>
                      <div className="text-xs text-gray-400 mt-1">{vertex.tags && vertex.tags.join(', ')}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover/item:text-primary-500 transition-colors" />
                  </div>
                </Link>
              ))}
              {group.length > 3 && (
                <div className="text-gray-500 text-sm font-medium pt-2">
                  +{group.length - 3} more...
                </div>
              )}
            </div>
          </div>
        ))}
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
                  <p className="text-sm text-gray-500 font-mono mb-1">{vertex.abbreviation}</p>
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
                Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 