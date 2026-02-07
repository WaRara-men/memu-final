import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import GlitchDemo from './pages/GlitchDemo';

function App() {
  return (
    <BrowserRouter>
      <div className="relative">
        {/* Navigation Overlay - only visible on hover or if needed */}
        <nav className="fixed top-4 right-4 z-50 flex gap-4">
          <Link 
            to="/" 
            className="px-3 py-1 bg-gray-800/80 text-white text-xs rounded border border-gray-600 hover:bg-purple-600 transition-colors backdrop-blur-sm"
          >
            Chat Agent
          </Link>
          <Link 
            to="/glitch" 
            className="px-3 py-1 bg-gray-800/80 text-white text-xs rounded border border-gray-600 hover:bg-cyan-600 transition-colors backdrop-blur-sm"
          >
            Glitch Demo
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/glitch" element={<GlitchDemo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
