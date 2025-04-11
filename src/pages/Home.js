import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Fade, Grow } from '@mui/material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import '../styles/Home.css';

function Home() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const userFlashcardsRef = collection(db, 'users', currentUser.uid, 'flashcards');
        const flashcardsQuery = query(
          userFlashcardsRef,
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(flashcardsQuery);
        const decksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        setDecks(decksData);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
        setTimeout(() => setShowContent(true), 300);
      }
    };

    if (currentUser) {
      fetchDecks();
    }
  }, [currentUser]);

  return (
    <div className="home-container">
      <div className="home-background">
        <div className="floating-cards">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
          ))}
        </div>
        <div className="gradient-overlay" />
      </div>

      <Fade in={true} timeout={800}>
        <div className="home-content">
          <div className="home-header-section">
            <img 
              src="/logo.svg" 
              alt="Flashcards Logo" 
              className="home-logo"
            />
            <Typography className="home-header-title">
              Your Flash Card Decks
            </Typography>
            <Typography className="home-header-subtitle">
              Create, study, and master your knowledge
            </Typography>
            <Button
              component={RouterLink}
              to="/create"
              variant="contained"
              startIcon={<AddIcon />}
              className="create-deck-button"
            >
              Create New Deck
            </Button>
          </div>

          {loading ? (
            <Box className="loading-container">
              <div className="loading-spinner" />
            </Box>
          ) : decks.length === 0 ? (
            <Grow in={showContent} timeout={500}>
              <div className="home-empty-state">
                <CollectionsBookmarkIcon className="home-empty-state-icon" />
                <Typography variant="h5" gutterBottom>
                  No Decks Yet
                </Typography>
                <Typography>
                  Create your first deck to start learning!
                </Typography>
              </div>
            </Grow>
          ) : (
            <div className="home-deck-grid">
              {decks.map((deck, index) => (
                <Grow 
                  in={showContent} 
                  timeout={500} 
                  style={{ transitionDelay: `${index * 100}ms` }}
                  key={deck.id}
                >
                  <div className="home-deck-card">
                    <div className="home-deck-content">
                      <Typography className="home-deck-title">
                        {deck.title}
                      </Typography>
                      <div className="home-deck-info">
                        <div className="home-card-count">
                          <CollectionsBookmarkIcon />
                          <Typography>
                            {deck.cards?.length || 0} cards
                          </Typography>
                        </div>
                        <Typography>
                          {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : 'Recently'}
                        </Typography>
                      </div>
                      <Button
                        component={RouterLink}
                        to={`/study/${deck.id}`}
                        className="home-study-button"
                      >
                        Start Studying
                      </Button>
                    </div>
                  </div>
                </Grow>
              ))}
            </div>
          )}
        </div>
      </Fade>
    </div>
  );
}

export default Home; 