import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TranslateIcon from '@mui/icons-material/Translate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import '../styles/Settings.css';

function Settings({ open, onClose }) {
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

  const handleChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('userSettings', JSON.stringify(settings));
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="settings-dialog"
    >
      <DialogContent className="settings-content">
        <IconButton
          onClick={onClose}
          className="settings-close-button"
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h4" className="settings-title">
          Settings
        </Typography>

        <Grid container spacing={4} className="settings-grid">
          {/* Appearance Section */}
          <Grid item xs={12}>
            <Typography variant="h6" className="settings-section-title">
              <ColorLensIcon /> Appearance
            </Typography>
            <Divider className="settings-divider" />
            
            <Box className="settings-section">
              <FormControl fullWidth className="settings-control">
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  disabled={settings.autoTheme}
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
                  />
                }
                label={
                  <Box className="settings-label">
                    <BrightnessAutoIcon />
                    <span>Auto Theme</span>
                  </Box>
                }
              />

              <FormControl fullWidth className="settings-control">
                <InputLabel>Color Scheme</InputLabel>
                <Select
                  value={settings.colorScheme}
                  onChange={(e) => handleChange('colorScheme', e.target.value)}
                >
                  <MenuItem value="blue">Blue</MenuItem>
                  <MenuItem value="purple">Purple</MenuItem>
                  <MenuItem value="green">Green</MenuItem>
                  <MenuItem value="orange">Orange</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Study Preferences */}
          <Grid item xs={12}>
            <Typography variant="h6" className="settings-section-title">
              <VisibilityIcon /> Study Preferences
            </Typography>
            <Divider className="settings-divider" />
            
            <Box className="settings-section">
              <Typography gutterBottom>Font Size</Typography>
              <Slider
                value={settings.fontSize}
                onChange={(e, value) => handleChange('fontSize', value)}
                min={12}
                max={24}
                step={1}
                marks
                valueLabelDisplay="auto"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.cardFlipAnimation}
                    onChange={(e) => handleChange('cardFlipAnimation', e.target.checked)}
                  />
                }
                label="Card Flip Animation"
              />
            </Box>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12}>
            <Typography variant="h6" className="settings-section-title">
              <NotificationsIcon /> Notifications
            </Typography>
            <Divider className="settings-divider" />
            
            <Box className="settings-section">
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                  />
                }
                label="Enable Notifications"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.studyReminders}
                    onChange={(e) => handleChange('studyReminders', e.target.checked)}
                  />
                }
                label="Study Reminders"
              />
            </Box>
          </Grid>

          {/* Sound Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" className="settings-section-title">
              <VolumeUpIcon /> Sound
            </Typography>
            <Divider className="settings-divider" />
            
            <Box className="settings-section">
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sound}
                    onChange={(e) => handleChange('sound', e.target.checked)}
                  />
                }
                label="Enable Sound Effects"
              />

              <Typography gutterBottom>Volume</Typography>
              <Slider
                value={settings.volume}
                onChange={(e, value) => handleChange('volume', value)}
                disabled={!settings.sound}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>

          {/* Language */}
          <Grid item xs={12}>
            <Typography variant="h6" className="settings-section-title">
              <TranslateIcon /> Language
            </Typography>
            <Divider className="settings-divider" />
            
            <Box className="settings-section">
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                </Select>
              </FormControl>
            </Box>
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
  );
}

export default Settings; 