import React, { useState } from 'react';
import { TextField, Typography, Button, Box, Fade, Grow } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/CreateDeck.css';

function CreateDeck() {
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index) => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
    }
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || cards.some(card => !card.front.trim() || !card.back.trim())) {
      return;
    }

    if (!currentUser) {
      console.error('No authenticated user');
      return;
    }

    setLoading(true);
    try {
      const deckRef = await addDoc(collection(db, 'users', currentUser.uid, 'flashcards'), {
        title: title.trim(),
        cards: cards.map(card => ({
          front: card.front.trim(),
          back: card.back.trim()
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating deck:', error);
      setLoading(false);
    }
  };

  return (
    <div className="createdeck-container">
      <div className="createdeck-background">
        <div className="floating-cards">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
          ))}
        </div>
        <div className="gradient-overlay" />
      </div>

      <Fade in={true} timeout={800}>
        <div className="createdeck-content">
          <div className="createdeck-header-section">
            <img 
              src="/logo.svg" 
              alt="Flashcards Logo" 
              className="createdeck-logo"
            />
            <Typography className="createdeck-header-title">
              Create New Deck
            </Typography>
            <Typography className="createdeck-header-subtitle">
              Build your knowledge one card at a time
            </Typography>
          </div>

          <Box component="form" onSubmit={handleSubmit} className="createdeck-form">
            <TextField
              fullWidth
              label="Deck Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="createdeck-title-input"
              required
              variant="outlined"
              InputProps={{
                className: 'createdeck-input-field'
              }}
            />

            <div className="createdeck-cards-container">
              {cards.map((card, index) => (
                <Grow in={true} timeout={500} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className="createdeck-card-container">
                    <div className="createdeck-card-header">
                      <Typography className="createdeck-card-number">
                        Card {index + 1}
                      </Typography>
                      {cards.length > 1 && (
                        <DeleteIcon
                          className="createdeck-remove-card"
                          onClick={() => handleRemoveCard(index)}
                        />
                      )}
                    </div>
                    <TextField
                      fullWidth
                      label="Front"
                      value={card.front}
                      onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                      className="createdeck-card-input"
                      required
                      multiline
                      rows={2}
                      variant="outlined"
                      InputProps={{
                        className: 'createdeck-input-field'
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Back"
                      value={card.back}
                      onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                      className="createdeck-card-input"
                      required
                      multiline
                      rows={2}
                      variant="outlined"
                      InputProps={{
                        className: 'createdeck-input-field'
                      }}
                    />
                  </div>
                </Grow>
              ))}
            </div>

            <div className="createdeck-action-buttons">
              <Button
                variant="contained"
                onClick={handleAddCard}
                className="createdeck-add-card-button"
                startIcon={<AddIcon />}
              >
                Add Card
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="createdeck-create-button"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Deck'}
              </Button>
            </div>
          </Box>
        </div>
      </Fade>
    </div>
  );
}

export default CreateDeck; 