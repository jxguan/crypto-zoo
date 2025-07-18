import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GraphView from './pages/GraphView';
import VertexPage from './pages/VertexPage';
import EdgePage from './pages/EdgePage';
import SearchPage from './pages/SearchPage';
import ToolPage from './pages/ToolPage';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="container mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="/v/:id" element={<VertexPage />} />
            <Route path="/edge/:id" element={<EdgePage />} />
            <Route path="/search" element={<SearchPage query={searchQuery} />} />
            <Route path="/tool" element={<ToolPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
