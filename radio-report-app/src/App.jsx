import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';

const SessionTimeout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let activityInterval;

    const logoutUser = () => {
      const token = sessionStorage.getItem('token');
      const sessionId = sessionStorage.getItem('session_id');

      if (token && sessionId) {
        fetch('/api/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: sessionId })
        }).catch(err => console.error("Logout failed:", err));
      }

      sessionStorage.clear();
      navigate('/login');
    };

    const updateLastActivity = () => {
      if (sessionStorage.getItem('isAuthenticated') === 'true') {
        sessionStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    const checkInactivity = () => {
      if (sessionStorage.getItem('isAuthenticated') === 'true') {
        const lastActivity = sessionStorage.getItem('lastActivity');
        if (lastActivity) {
          const inactiveTime = Date.now() - parseInt(lastActivity, 10);
          if (inactiveTime >= 5 * 60 * 1000) { // 20 minutes
            logoutUser();
          }
        } else {
          updateLastActivity();
        }
      }
    };

    // Update activity on mount just in case
    updateLastActivity();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const throttleUpdate = () => {
      // Small throttle to avoid too many writes to sessionStorage
      updateLastActivity();
    };

    events.forEach(event => document.addEventListener(event, throttleUpdate));

    // Check every 10 seconds
    activityInterval = setInterval(checkInactivity, 10000);

    return () => {
      events.forEach(event => document.removeEventListener(event, throttleUpdate));
      clearInterval(activityInterval);
    };
  }, [navigate]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    const handleTabClose = () => {
      const token = sessionStorage.getItem('token');
      const sessionId = sessionStorage.getItem('session_id');

      if (token && sessionId) {
        // Use navigator.sendBeacon or fetch with keepalive to notify backend on close
        fetch('/api/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: sessionId }),
          keepalive: true
        });
      }
    };

    window.addEventListener('pagehide', handleTabClose);
    return () => window.removeEventListener('pagehide', handleTabClose);
  }, []);

  return (
    <Router>
      <SessionTimeout />
      <Routes>
        {/* Default route redirects to login if not authenticated, else dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin-panel"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
