import React, { useState, useEffect } from 'react';
import { Typography, Button, Box } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlipIcon from '@mui/icons-material/Flip';
import '../styles/Study.css';

function Study() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [deck, setDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeck = async () => {
      if (!currentUser) {
        setError('Please log in to view this deck');
        setLoading(false);
        return;
      }

      try {
        const deckDoc = await getDoc(doc(db, 'users', currentUser.uid, 'flashcards', deckId));
        if (deckDoc.exists()) {
          setDeck(deckDoc.data());
        } else {
          setError('Deck not found');
        }
      } catch (error) {
        console.error('Error fetching deck:', error);
        setError('Error loading deck');
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, currentUser]);

  const handleNextCard = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowBack(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowBack(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'ArrowRight') {
      handleNextCard();
    } else if (event.key === 'ArrowLeft') {
      handlePreviousCard();
    } else if (event.key === ' ') {
      setShowBack(!showBack);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentCardIndex, showBack]);

  if (loading) {
    return (
      <div className="study-container">
        <div className="study-header-section">
          <Typography className="study-header-title">
            Loading...
          </Typography>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="study-container">
        <div className="study-header-section">
          <Typography className="study-header-title">
            {error || 'Deck not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            className="study-nav-button"
          >
            Back to Decks
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = deck.cards[currentCardIndex];

  return (
    <div className="study-container">
      <div className="study-header-section">
        <Typography className="study-header-title">
          {deck.title}
        </Typography>
      </div>

      <div className="study-flashcard" onClick={() => setShowBack(!showBack)}>
        <div className="study-card-content">
          <Typography className="study-card-text">
            {showBack ? currentCard.back : currentCard.front}
          </Typography>
          <Button
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              setShowBack(!showBack);
            }}
            className="study-flip-button"
            startIcon={<FlipIcon />}
          >
            {showBack ? 'Show Front' : 'Show Back'}
          </Button>
        </div>
      </div>

      <div className="study-navigation-container">
        <Button
          variant="contained"
          onClick={handlePreviousCard}
          disabled={currentCardIndex === 0}
          className="study-nav-button"
          startIcon={<ArrowBackIcon />}
        >
          Previous
        </Button>
        <Typography className="study-progress-text">
          Card {currentCardIndex + 1} of {deck.cards.length}
        </Typography>
        <Button
          variant="contained"
          onClick={handleNextCard}
          disabled={currentCardIndex === deck.cards.length - 1}
          className="study-nav-button"
          endIcon={<ArrowForwardIcon />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Study; 