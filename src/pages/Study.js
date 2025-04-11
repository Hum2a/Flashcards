import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Fade, Grow, Zoom } from '@mui/material';
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
  const [isFlipping, setIsFlipping] = useState(false);

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

  const handleFlip = () => {
    setIsFlipping(true);
    setShowBack(!showBack);
    setTimeout(() => setIsFlipping(false), 300);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'ArrowRight') {
      handleNextCard();
    } else if (event.key === 'ArrowLeft') {
      handlePreviousCard();
    } else if (event.key === ' ') {
      handleFlip();
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
        <div className="study-background">
          <div className="floating-cards">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
            ))}
          </div>
          <div className="gradient-overlay" />
        </div>
        <div className="study-content">
          <div className="study-loading">
            <div className="study-spinner"></div>
            <Typography className="study-loading-text">Loading your deck...</Typography>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="study-container">
        <div className="study-background">
          <div className="floating-cards">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
            ))}
          </div>
          <div className="gradient-overlay" />
        </div>
        <div className="study-content">
          <div className="study-error">
            <Typography className="study-error-title">{error || 'Deck not found'}</Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              className="study-back-button"
            >
              Back to Decks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = deck.cards[currentCardIndex];

  return (
    <div className="study-container">
      <div className="study-background">
        <div className="floating-cards">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
          ))}
        </div>
        <div className="gradient-overlay" />
      </div>

      <div className="study-content">
        <Fade in={true} timeout={800}>
          <div className="study-header-section">
            {deck.imageUrl && (
              <div className="study-deck-image-container">
                <img 
                  src={deck.imageUrl} 
                  alt={deck.title} 
                  className="study-deck-image"
                />
                <div className="study-deck-image-overlay" />
              </div>
            )}
            <Typography className="study-header-title">
              {deck.title}
            </Typography>
            <Typography className="study-progress-text">
              Card {currentCardIndex + 1} of {deck.cards.length}
            </Typography>
          </div>
        </Fade>

        <Grow in={true} timeout={500}>
          <div 
            className={`study-flashcard ${showBack ? 'flipped' : ''} ${isFlipping ? 'flipping' : ''}`}
            onClick={handleFlip}
          >
            <div className="study-card-content">
              <Zoom in={!showBack} timeout={300}>
                <Typography className="study-card-text">
                  {currentCard.front}
                </Typography>
              </Zoom>
              <Zoom in={showBack} timeout={300}>
                <Typography className="study-card-text">
                  {currentCard.back}
                </Typography>
              </Zoom>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="study-flip-button"
                startIcon={<FlipIcon />}
              >
                {showBack ? 'Show Front' : 'Show Back'}
              </Button>
            </div>
          </div>
        </Grow>

        <Fade in={true} timeout={800}>
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
        </Fade>
      </div>
    </div>
  );
}

export default Study; 