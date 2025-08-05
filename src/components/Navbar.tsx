import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, User, LogOut, Settings, Plus, ChevronDown, Users, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { User as UserType } from '../types/crypto';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: UserType | null;
  onSignOut: () => Promise<void>;
}

export default function Navbar({ searchQuery, setSearchQuery, currentUser, onSignOut }: NavbarProps) {
  const navigate = useNavigate();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };

  const handleSignOut = async () => {
    await onSignOut();
    navigate('/');
  };

  const getDisplayName = (user: UserType) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    } else {
      return user.email;
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
            <Link to="/submit-edit" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>Submit Edit</span>
            </Link>
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

          {/* User Menu */}
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{getDisplayName(currentUser)}</span>
                {currentUser.role === 'admin' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {currentUser.role === 'admin' && (
                  <div className="relative" ref={adminDropdownRef}>
                    <button
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-md hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                                         {isAdminDropdownOpen && (
                       <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                         <Link
                           to="/admin"
                           onClick={() => {
                             setIsAdminDropdownOpen(false);
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                           }}
                           className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                         >
                           <FileText className="w-4 h-4" />
                           <span>Review Edits</span>
                         </Link>
                         <Link
                           to="/manage-users"
                           onClick={() => {
                             setIsAdminDropdownOpen(false);
                             window.scrollTo({ top: 0, behavior: 'smooth' });
                           }}
                           className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                         >
                           <Users className="w-4 h-4" />
                           <span>Manage Users</span>
                         </Link>
                       </div>
                     )}
                  </div>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/auth?mode=login"
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 