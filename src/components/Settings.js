import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Button,
  Grid,
  Fade,
  Grow,
  Zoom,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TranslateIcon from '@mui/icons-material/Translate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/Settings.css';

function Settings({ open, onClose }) {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'light',
    autoTheme: true,
    notifications: true,
    sound: true,
    fontSize: 16,
    language: 'en',
    cardFlipAnimation: true,
    colorScheme: 'blue',
    studyReminders: true,
    volume: 70
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentUser) {
        setError('Please log in to access settings');
        setLoading(false);
        return;
      }

      try {
        const settingsDoc = await getDoc(doc(db, 'users', currentUser.uid, 'admin', 'settings'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Error loading settings');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchSettings();
    }
  }, [currentUser, open]);

  const handleChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser) {
      setError('Please log in to save settings');
      return;
    }

    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'admin', 'settings'), settings);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Error saving settings');
    }
  };

  if (loading) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        className="settings-dialog"
        TransitionComponent={Fade}
        transitionDuration={500}
      >
        <DialogContent className="settings-content">
          <div className="settings-background">
            <div className="floating-cards">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
              ))}
            </div>
            <div className="gradient-overlay" />
          </div>
          <div className="settings-loading">
            <div className="settings-spinner"></div>
            <Typography className="settings-loading-text">Loading your settings...</Typography>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        className="settings-dialog"
        TransitionComponent={Fade}
        transitionDuration={500}
      >
        <DialogContent className="settings-content">
          <div className="settings-background">
            <div className="floating-cards">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
              ))}
            </div>
            <div className="gradient-overlay" />
          </div>

          <IconButton
            onClick={onClose}
            className="settings-close-button"
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h4" className="settings-title">
            Settings
          </Typography>

          {error && (
            <Alert severity="error" className="settings-error">
              {error}
            </Alert>
          )}

          <Grid container spacing={4} className="settings-grid">
            {/* Appearance Section */}
            <Grid item xs={12}>
              <Grow in={true} timeout={300}>
                <div className="settings-section-container">
                  <Typography variant="h6" className="settings-section-title">
                    <ColorLensIcon className="settings-icon" />
                    Appearance
                  </Typography>
                  <Divider className="settings-divider" />
                  
                  <Box className="settings-section">
                    <FormControl fullWidth className="settings-control">
                      <InputLabel>Theme</InputLabel>
                      <Select
                        value={settings.theme}
                        onChange={(e) => handleChange('theme', e.target.value)}
                        disabled={settings.autoTheme}
                        className="settings-select"
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoTheme}
                          onChange={(e) => handleChange('autoTheme', e.target.checked)}
                          className="settings-switch"
                        />
                      }
                      label={
                        <Box className="settings-label">
                          <BrightnessAutoIcon className="settings-icon" />
                          <span>Auto Theme</span>
                        </Box>
                      }
                    />

                    <FormControl fullWidth className="settings-control">
                      <InputLabel>Color Scheme</InputLabel>
                      <Select
                        value={settings.colorScheme}
                        onChange={(e) => handleChange('colorScheme', e.target.value)}
                        className="settings-select"
                      >
                        <MenuItem value="blue">Blue</MenuItem>
                        <MenuItem value="purple">Purple</MenuItem>
                        <MenuItem value="green">Green</MenuItem>
                        <MenuItem value="orange">Orange</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </div>
              </Grow>
            </Grid>

            {/* Study Preferences */}
            <Grid item xs={12}>
              <Grow in={true} timeout={400}>
                <div className="settings-section-container">
                  <Typography variant="h6" className="settings-section-title">
                    <VisibilityIcon className="settings-icon" />
                    Study Preferences
                  </Typography>
                  <Divider className="settings-divider" />
                  
                  <Box className="settings-section">
                    <Typography gutterBottom className="settings-slider-label">Font Size</Typography>
                    <Slider
                      value={settings.fontSize}
                      onChange={(e, value) => handleChange('fontSize', value)}
                      min={12}
                      max={24}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      className="settings-slider"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.cardFlipAnimation}
                          onChange={(e) => handleChange('cardFlipAnimation', e.target.checked)}
                          className="settings-switch"
                        />
                      }
                      label="Card Flip Animation"
                    />
                  </Box>
                </div>
              </Grow>
            </Grid>

            {/* Notifications */}
            <Grid item xs={12}>
              <Grow in={true} timeout={500}>
                <div className="settings-section-container">
                  <Typography variant="h6" className="settings-section-title">
                    <NotificationsIcon className="settings-icon" />
                    Notifications
                  </Typography>
                  <Divider className="settings-divider" />
                  
                  <Box className="settings-section">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications}
                          onChange={(e) => handleChange('notifications', e.target.checked)}
                          className="settings-switch"
                        />
                      }
                      label="Enable Notifications"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.studyReminders}
                          onChange={(e) => handleChange('studyReminders', e.target.checked)}
                          className="settings-switch"
                        />
                      }
                      label="Study Reminders"
                    />
                  </Box>
                </div>
              </Grow>
            </Grid>

            {/* Sound Settings */}
            <Grid item xs={12}>
              <Grow in={true} timeout={600}>
                <div className="settings-section-container">
                  <Typography variant="h6" className="settings-section-title">
                    <VolumeUpIcon className="settings-icon" />
                    Sound
                  </Typography>
                  <Divider className="settings-divider" />
                  
                  <Box className="settings-section">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.sound}
                          onChange={(e) => handleChange('sound', e.target.checked)}
                          className="settings-switch"
                        />
                      }
                      label="Enable Sound Effects"
                    />

                    <Typography gutterBottom className="settings-slider-label">Volume</Typography>
                    <Slider
                      value={settings.volume}
                      onChange={(e, value) => handleChange('volume', value)}
                      disabled={!settings.sound}
                      valueLabelDisplay="auto"
                      className="settings-slider"
                    />
                  </Box>
                </div>
              </Grow>
            </Grid>

            {/* Language */}
            <Grid item xs={12}>
              <Grow in={true} timeout={700}>
                <div className="settings-section-container">
                  <Typography variant="h6" className="settings-section-title">
                    <TranslateIcon className="settings-icon" />
                    Language
                  </Typography>
                  <Divider className="settings-divider" />
                  
                  <Box className="settings-section">
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={settings.language}
                        onChange={(e) => handleChange('language', e.target.value)}
                        className="settings-select"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                        <MenuItem value="fr">Français</MenuItem>
                        <MenuItem value="de">Deutsch</MenuItem>
                        <MenuItem value="zh">中文</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </div>
              </Grow>
            </Grid>
          </Grid>

          <Box className="settings-actions">
            <Button
              variant="outlined"
              onClick={onClose}
              className="settings-cancel-button"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              className="settings-save-button"
            >
              Save Changes
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={1500}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" className="settings-success">
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default Settings; 