import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  Divider,
  Grid,
  Paper,
  Button,
  DialogActions,
  DialogTitle
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

function Profile({ open, onClose }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    try {
      // Delete all user's flashcards
      const flashcardsRef = collection(db, 'users', currentUser.uid, 'flashcards');
      const flashcardsSnapshot = await getDocs(flashcardsRef);
      const deletePromises = flashcardsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user profile document
      await deleteDoc(doc(db, 'users', currentUser.uid));

      // Delete the user account
      await deleteUser(currentUser);

      // Navigate to auth page
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      // Handle specific errors
      if (error.code === 'auth/requires-recent-login') {
        alert('Please sign in again before deleting your account.');
      } else {
        alert('An error occurred while deleting your account. Please try again.');
      }
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        className="profile-dialog"
      >
        <DialogContent className="profile-content">
          <IconButton
            onClick={onClose}
            className="profile-close-button"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Box className="profile-header">
            <Avatar
              src={currentUser.photoURL}
              alt={currentUser.displayName || currentUser.email}
              className="profile-avatar"
              sx={{ width: 100, height: 100 }}
            >
              {currentUser.email?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h5" className="profile-name">
              {currentUser.displayName || currentUser.email.split('@')[0]}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="profile-email">
              {currentUser.email}
            </Typography>
          </Box>

          <Divider className="profile-divider" sx={{ my: 2 }} />

          {loading ? (
            <Typography className="profile-loading">Loading profile data...</Typography>
          ) : userData ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} className="profile-stat-card">
                  <Typography variant="h4" className="profile-stat-number">
                    {userData.flashcardsCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="profile-stat-label">
                    Total Flashcards
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} className="profile-stat-card">
                  <Typography variant="h4" className="profile-stat-number">
                    {userData.studySessions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="profile-stat-label">
                    Study Sessions
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} className="profile-stat-card">
                  <Typography variant="h4" className="profile-stat-number">
                    {userData.totalCardsStudied || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="profile-stat-label">
                    Cards Studied
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={0} className="profile-stat-card">
                  <Typography variant="h4" className="profile-stat-number">
                    {userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="profile-stat-label">
                    Member Since
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography className="profile-error">Error loading profile data</Typography>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              className="profile-delete-button"
            >
              Delete Account
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        className="profile-delete-dialog"
      >
        <DialogTitle className="profile-delete-title">Delete Account</DialogTitle>
        <DialogContent className="profile-delete-content">
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
            All your flashcards and data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions className="profile-delete-actions">
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            variant="contained"
            className="profile-delete-confirm"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Profile; 