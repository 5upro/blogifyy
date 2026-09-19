import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Auth/AuthContext';
import Login from './Auth/Login';
import Register from './Auth/Register';
import ForgotPassword from './Auth/ForgotPassword';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import CreateBlog from './components/CreateBlog';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/privacy';
import Learnmore from './components/Learnmore';
import Contact from './components/Contact';
import Profile from './components/Profile';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
      </div>
    );
  }
  if (user) return <Navigate to="/profile" replace />;
  return children;
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [refreshBlogs, setRefreshBlogs] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/oldlogo.png" alt="Blogify" className="h-10 w-auto object-contain drop-shadow-md" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Blogify</h1>
                <p className="text-sm text-white/40">Welcome, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-block px-3 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
                {user.role}
              </span>

              <button
                onClick={() => { setShowCreateBlog(!showCreateBlog); setShowAdminDashboard(false); }}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] text-white px-4 py-2 rounded-xl font-medium transition-all"
              >
                {showCreateBlog ? 'View Blogs' : 'Create Blog'}
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1] px-4 py-2 rounded-xl font-medium transition-all"
              >
                Profile
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => { setShowAdminDashboard(!showAdminDashboard); setShowCreateBlog(false); }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 px-4 py-2 rounded-xl font-medium transition-all"
                >
                  {showAdminDashboard ? 'Exit Admin' : 'Admin'}
                </button>
              )}

              <button
                onClick={logout}
                className="bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] px-4 py-2 rounded-xl font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {showAdminDashboard ? (
          <AdminDashboard />
        ) : showCreateBlog ? (
          <CreateBlog
            onBlogCreated={() => {
              setRefreshBlogs(prev => prev + 1);
              setShowCreateBlog(false);
            }}
          />
        ) : (
          <BlogList key={refreshBlogs} />
        )}
      </main>
    </div>
  );
};

const AuthPages = () => {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'

  return (
    <div>
      {view === 'register' ? (
        <Register onToggle={() => setView('login')} />
      ) : view === 'forgot' ? (
        <ForgotPassword onBackToLogin={() => setView('login')} />
      ) : (
        <Login onToggle={() => setView('register')} onForgotPassword={() => setView('forgot')} />
      )}
    </div>
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to="/profile" replace />
          ) : (
            <LandingPage onGetStarted={() => navigate('/login')} />
          )
        } 
      />
      <Route path="/login" element={<PublicRoute><AuthPages /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register onToggle={() => window.location.href = '/login'} /></PublicRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/blogs" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog/:id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
      <Route path="/learnmore" element={<Learnmore />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
