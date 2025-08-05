import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import { Auth } from './components/Auth';
import { supabaseService } from './services/supabaseService';
import { supabase } from './lib/supabase';
import HomePage from './pages/HomePage';
import GraphView from './pages/GraphView';
import VertexPage from './pages/VertexPage';
import EdgePage from './pages/EdgePage';
import SearchPage from './pages/SearchPage';
import ToolPage from './pages/ToolPage';
import { AdminPage } from './pages/AdminPage';
import { SubmitEditPage } from './pages/SubmitEditPage';
import ManageUsersPage from './pages/ManageUsersPage';
import type { User } from './types/crypto';
import { useLocation } from 'react-router-dom';

// Wrapper component to handle auth route with URL parameters
function AuthRoute({ currentUser, onAuthSuccess }: { currentUser: User | null; onAuthSuccess: (user: User) => void }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode') as 'login' | 'signup' | null;
  
  if (currentUser) {
    return <HomePage />;
  }
  
  return <Auth onAuthSuccess={onAuthSuccess} initialMode={mode || 'login'} />;
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef<User | null>(null);
  useEffect(() => {
    let isInitialized = false;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          try {
            const user = await supabaseService.getCurrentUser(session);
            setCurrentUser(user);
            currentUserRef.current = user;
          } catch (error) {
            console.error('Error handling initial session:', error);
            setCurrentUser(null);
            currentUserRef.current = null;
          }
        } else {
          setCurrentUser(null);
          currentUserRef.current = null;
        }
        
        if (!isInitialized) {
          setLoading(false);
          isInitialized = true;
        }
      } else if (event === 'SIGNED_IN' && session?.user && isInitialized && currentUserRef.current === null) {
        // Only handle SIGNED_IN if already initialized and no current user
        try {
          const user = await supabaseService.getCurrentUser(session);
          setCurrentUser(user);
          currentUserRef.current = user;
        } catch (error) {
          console.error('Error handling sign in:', error);
          setCurrentUser(null);
          currentUserRef.current = null;
        }
      } else if (event === 'SIGNED_IN' && session?.user && isInitialized && currentUserRef.current !== null) {
        // SIGNED_IN when already initialized and user exists - ignore
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        currentUserRef.current = null;
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Handle token refresh (important for page refreshes)
        try {
          const user = await supabaseService.getCurrentUser(session);
          setCurrentUser(user);
          currentUserRef.current = user;
        } catch (error) {
          console.error('Error handling token refresh:', error);
          setCurrentUser(null);
          currentUserRef.current = null;
        }
      }
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignOut = async () => {
    try {
      await supabaseService.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <div className="text-gray-500 mt-4">Loading...</div>
          <div className="text-sm text-gray-400 mt-2">Initializing application</div>
        </div>
      </div>
    );
  }

  // Allow anonymous access to all pages, but show auth for admin features
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Navbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
        <main className="container mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="/v/:id" element={<VertexPage currentUser={currentUser} />} />
            <Route path="/edge/:id" element={<EdgePage currentUser={currentUser} />} />
            <Route path="/search" element={<SearchPage query={searchQuery} />} />
            <Route path="/tool" element={<ToolPage />} />
            <Route path="/submit-edit" element={<SubmitEditPage />} />
            <Route path="/admin" element={<AdminPage currentUser={currentUser} />} />
            <Route path="/manage-users" element={<ManageUsersPage currentUser={currentUser} />} />
            <Route path="/auth" element={<AuthRoute currentUser={currentUser} onAuthSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
