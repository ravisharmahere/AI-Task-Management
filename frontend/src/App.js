import React from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';

import './index.css';

function App() {
  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!localStorage.getItem('token')) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route
          path="/login"
          element={localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={
            localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={localStorage.getItem('token') ? '/dashboard' : '/login'} replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
