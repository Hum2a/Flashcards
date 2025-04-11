import React, { useState, useEffect } from 'react';
import { Typography, Button, Box } from '@mui/material';
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
      }
    };

    if (currentUser) {
      fetchDecks();
    }
  }, [currentUser]);

  return (
    <div className="home-container">
      <div className="home-header-section">
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
          sx={{
            background: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)',
            color: 'white',
            padding: '0.8rem 2rem',
            borderRadius: '8px',
            fontWeight: 600,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            }
          }}
        >
          Create New Deck
        </Button>
      </div>

      {loading ? (
        <Box sx={{ textAlign: 'center', padding: '3rem' }}>
          <Typography>Loading your decks...</Typography>
        </Box>
      ) : decks.length === 0 ? (
        <div className="home-empty-state">
          <CollectionsBookmarkIcon className="home-empty-state-icon" />
          <Typography variant="h5" gutterBottom>
            No Decks Yet
          </Typography>
          <Typography>
            Create your first deck to start learning!
          </Typography>
        </div>
      ) : (
        <div className="home-deck-grid">
          {decks.map((deck) => (
            <div key={deck.id} className="home-deck-card">
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Home; 