import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Crypto Zoo
              </span>
              <div className="text-xs text-gray-500 font-medium">Cryptographic Primitives</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/graph" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Graph</Link>
            <Link to="/search" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Search</Link>
            <Link to="/tool" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Tools</Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search primitives and constructions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-500"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
} 