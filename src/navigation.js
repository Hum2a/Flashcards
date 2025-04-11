import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateDeck from './pages/CreateDeck';
import Study from './pages/Study';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

function Navigation() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <>
                <Navbar />
                <Home />
              </>
            </PrivateRoute>
          } />
          <Route path="/create" element={
            <PrivateRoute>
              <>
                <Navbar />
                <CreateDeck />
              </>
            </PrivateRoute>
          } />
          <Route path="/study/:deckId" element={
            <PrivateRoute>
              <>
                <Navbar />
                <Study />
              </>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Prevents authenticated users from accessing auth pages
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  return currentUser ? <Navigate to="/" /> : children;
}

export default Navigation;