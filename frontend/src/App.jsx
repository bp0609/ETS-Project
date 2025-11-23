import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import ThreadChat from './components/ThreadChat';
import Dashboard from './components/Dashboard';

// Protected Route wrapper - requires authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return user ? children : <Navigate to="/" replace />;
};

// Teacher Route wrapper - requires teacher role
const TeacherRoute = ({ children }) => {
  const { user, isTeacher, loading } = useUser();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return isTeacher() ? children : <Navigate to="/home" replace />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/thread/:threadId"
          element={
            <ProtectedRoute>
              <ThreadChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <TeacherRoute>
              <Dashboard />
            </TeacherRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </Router>
  );
}

export default App;

