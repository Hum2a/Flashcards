import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Avatar, 
  IconButton,
  Menu,
  MenuItem,
  Fade,
  Badge,
  Tooltip
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import Profile from './Profile';
import Settings from './Settings';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notifications count

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
    handleClose();
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
    handleClose();
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        elevation={scrolled ? 4 : 0}
      >
        <Container maxWidth="lg" className="navbar-container">
          <Toolbar disableGutters>
            <RouterLink to="/" className="navbar-brand">
              <img 
                src="/logo.svg" 
                alt="Flashcards Logo" 
                className="navbar-logo"
              />
              <Typography className="navbar-brand-text">
                FlashCards
              </Typography>
            </RouterLink>

            <div className="navbar-spacer" />

            <div className="navbar-actions">
              {currentUser && (
                <>
                  <Tooltip title="Notifications" arrow>
                    <IconButton className="navbar-notification-button">
                      <Badge badgeContent={notifications} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Profile" arrow>
                    <IconButton
                      onClick={handleProfileClick}
                      className="navbar-profile-button"
                    >
                      <Avatar 
                        src={currentUser.photoURL}
                        alt={currentUser.email}
                        className="navbar-avatar"
                      >
                        {currentUser.email?.[0]?.toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                    className="navbar-menu"
                  >
                    <MenuItem onClick={handleProfileOpen}>
                      <PersonIcon className="menu-icon" />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleSettingsOpen}>
                      <SettingsIcon className="menu-icon" />
                      Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon className="menu-icon" />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </div>
          </Toolbar>
        </Container>
      </AppBar>

      <Profile 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

export default Navbar; 