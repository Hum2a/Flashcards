import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import { signInWithGoogle, signInWithApple } from '../config/auth';
import '../styles/AuthPage.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const createUserProfile = async (user) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        lastLogin: new Date(),
        flashcardsCount: 0,
        studySessions: 0,
        totalCardsStudied: 0
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user);
      }
    } catch (error) {
      setError(
        error.code === 'auth/weak-password'
          ? 'Password should be at least 6 characters'
          : error.code === 'auth/email-already-in-use'
          ? 'Email already in use'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : error.code === 'auth/user-not-found'
          ? 'No account found with this email'
          : error.code === 'auth/wrong-password'
          ? 'Incorrect password'
          : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    setError('');
    setSocialLoading(provider);

    try {
      const result = provider === 'google' 
        ? await signInWithGoogle()
        : await signInWithApple();

      if (!result.success) {
        setError(result.error);
      } else if (result.isNewUser) {
        await createUserProfile(result.user);
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setSocialLoading('');
    }
  };

  return (
    <div className="auth-container">
      {/* Animated Background Elements */}
      <div className="auth-background">
        <div className="floating-cards">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
          ))}
        </div>
        <div className="gradient-overlay" />
      </div>

      <Fade in={true} timeout={800}>
        <Paper elevation={3} className="auth-paper">
          <div className="auth-header">
            <img 
              src="/logo.svg" 
              alt="Flashcards Logo" 
              className="auth-logo"
            />
            <Typography variant="h4" className="auth-title">
              Welcome to FlashCards
            </Typography>
            <Typography variant="subtitle1" className="auth-subtitle">
              Your personal learning companion
            </Typography>
          </div>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => {
              setActiveTab(newValue);
              setIsLogin(newValue === 0);
              setError('');
            }}
            className="auth-tabs"
            TabIndicatorProps={{
              className: 'tab-indicator'
            }}
          >
            <Tab label="Login" className="auth-tab" />
            <Tab label="Register" className="auth-tab" />
          </Tabs>

          {error && (
            <Alert severity="error" className="auth-alert">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="auth-form">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              variant="outlined"
              InputProps={{
                className: 'auth-input-field'
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              variant="outlined"
              InputProps={{
                className: 'auth-input-field'
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="auth-button"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </Button>
          </Box>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="social-buttons">
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleSocialSignIn('google')}
              startIcon={socialLoading === 'google' ? (
                <CircularProgress size={20} />
              ) : (
                <GoogleIcon />
              )}
              disabled={!!socialLoading}
              className="google-button"
            >
              Continue with Google
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleSocialSignIn('apple')}
              startIcon={socialLoading === 'apple' ? (
                <CircularProgress size={20} />
              ) : (
                <AppleIcon />
              )}
              disabled={!!socialLoading}
              className="apple-button"
            >
              Continue with Apple
            </Button>
          </div>
        </Paper>
      </Fade>
    </div>
  );
}

export default AuthPage; 