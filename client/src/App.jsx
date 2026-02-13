import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, Calendar, Home, User, GraduationCap, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/Home';
import StudentReport from './pages/StudentReport';
import ShiftManagement from './pages/ShiftManagement';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}`}>
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

// Protected Layout Component
const Layout = ({ children }) => {
  const { userRole, logout } = useAuth();
  if (!userRole) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 mb-4">
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            <span>SchoolERP</span>
          </h1>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit">
            {userRole === 'teacher' ? '👨‍🏫 Teacher Mode' : '👨‍👩‍👧 Parent Mode'}
          </div>
        </div>

        <nav className="px-4 py-2 space-y-2 flex-1">
          <SidebarItem to="/" icon={Home} label="Dashboard" />
          <SidebarItem to="/students" icon={User} label="Student Reports" />
          {userRole === 'teacher' && (
            <>
              <SidebarItem to="/shifts" icon={Calendar} label="Shift Management" />
              <SidebarItem to="/analytics" icon={BookOpen} label="Analytics" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/students" element={<Layout><StudentReport /></Layout>} />
            <Route path="/shifts" element={<Layout><ShiftManagement /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          </Routes>
        </AnimatePresence>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
};

export default App;
