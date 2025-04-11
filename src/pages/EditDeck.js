import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  IconButton, 
  CircularProgress,
  Fade,
  Grow
} from '@mui/material';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/EditDeck.css';
import { useAlert } from '../context/AlertContext';

function EditDeck() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [loading, setLoading] = useState(true);
  const [deckImage, setDeckImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const deckRef = doc(db, 'users', currentUser.uid, 'flashcards', deckId);
        const deckDoc = await getDoc(deckRef);
        
        if (deckDoc.exists()) {
          const deckData = deckDoc.data();
          setTitle(deckData.title);
          setCards(deckData.cards);
          setExistingImageUrl(deckData.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching deck:', error);
        showAlert({
          title: 'Error',
          message: 'Failed to load deck. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
        setTimeout(() => setShowContent(true), 300);
      }
    };

    if (currentUser) {
      fetchDeck();
    }
  }, [deckId, currentUser, showAlert]);

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index) => {
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setDeckImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (existingImageUrl) {
        const imageRef = ref(storage, existingImageUrl);
        await deleteObject(imageRef);
      }
      setExistingImageUrl(null);
      setDeckImage(null);
    } catch (error) {
      console.error('Error removing image:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to remove image. Please try again.',
        type: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || cards.some(card => !card.front.trim() || !card.back.trim())) {
      showAlert({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = existingImageUrl;
      
      if (deckImage) {
        try {
          if (existingImageUrl) {
            const oldImageRef = ref(storage, existingImageUrl);
            await deleteObject(oldImageRef);
          }

          const imageRef = ref(storage, `deck-images/${currentUser.uid}/${Date.now()}-${deckImage.name}`);
          await uploadBytes(imageRef, deckImage);
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error('Error handling image:', error);
          showAlert({
            title: 'Image Upload Error',
            message: 'Failed to update image. The deck will be updated without image changes.',
            type: 'warning'
          });
          imageUrl = null;
        }
      }

      const deckRef = doc(db, 'users', currentUser.uid, 'flashcards', deckId);
      await updateDoc(deckRef, {
        title: title.trim(),
        cards: cards.map(card => ({
          front: card.front.trim(),
          back: card.back.trim()
        })),
        imageUrl,
        updatedAt: serverTimestamp()
      });
      navigate('/');
    } catch (error) {
      console.error('Error updating deck:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to update deck. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    showAlert({
      title: 'Delete Deck',
      message: 'Are you sure you want to delete this deck? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Delete',
      onConfirm: async () => {
        setLoading(true);
        try {
          if (existingImageUrl) {
            const imageRef = ref(storage, existingImageUrl);
            await deleteObject(imageRef);
          }

          const deckRef = doc(db, 'users', currentUser.uid, 'flashcards', deckId);
          await deleteDoc(deckRef);
          navigate('/');
        } catch (error) {
          console.error('Error deleting deck:', error);
          showAlert({
            title: 'Error',
            message: 'Failed to delete deck. Please try again.',
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <Box className="editdeck-loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="editdeck-container">
      <div className="editdeck-background">
        <div className="floating-cards">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="floating-card" style={{ '--delay': `${i * 2}s` }} />
          ))}
        </div>
        <div className="gradient-overlay" />
      </div>

      <Fade in={true} timeout={800}>
        <div className="editdeck-content">
          <div className="editdeck-header-section">
            <IconButton 
              onClick={() => navigate('/')}
              className="editdeck-back-button"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography className="editdeck-header-title">
              Edit Flash Card Deck
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="editdeck-form">
            <TextField
              label="Deck Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              margin="normal"
              required
              className="editdeck-input-field"
            />

            <div className="editdeck-image-section">
              <Typography className="editdeck-image-label">Deck Image</Typography>
              <div className="editdeck-image-preview">
                {existingImageUrl && (
                  <div className="editdeck-image-container">
                    <img 
                      src={existingImageUrl} 
                      alt="Deck preview" 
                      className="editdeck-preview-image"
                    />
                    <div className="editdeck-image-overlay" />
                  </div>
                )}
                <div className="editdeck-image-actions">
                  <input
                    accept="image/*"
                    type="file"
                    id="deck-image-upload"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="deck-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      className="editdeck-upload-button"
                    >
                      {existingImageUrl ? 'Change Image' : 'Add Image'}
                    </Button>
                  </label>
                  {existingImageUrl && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveImage}
                      className="editdeck-remove-image-button"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
                {deckImage && (
                  <Typography className="editdeck-image-name">
                    Selected: {deckImage.name}
                  </Typography>
                )}
              </div>
            </div>

            <div className="editdeck-cards-container">
              {cards.map((card, index) => (
                <Grow in={showContent} timeout={500} key={index}>
                  <div className="editdeck-card-input">
                    <TextField
                      label={`Card ${index + 1} Front`}
                      value={card.front}
                      onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      className="editdeck-input-field"
                    />
                    <TextField
                      label={`Card ${index + 1} Back`}
                      value={card.back}
                      onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                      fullWidth
                      margin="normal"
                      required
                      className="editdeck-input-field"
                    />
                    <IconButton
                      onClick={() => handleRemoveCard(index)}
                      className="editdeck-remove-button"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Grow>
              ))}
            </div>

            <Button
              onClick={handleAddCard}
              startIcon={<AddIcon />}
              className="editdeck-add-button"
            >
              Add Card
            </Button>

            <div className="editdeck-actions">
              <Button
                type="submit"
                variant="contained"
                className="editdeck-save-button"
                disabled={loading}
              >
                Save Changes
              </Button>
              <Button
                onClick={handleDelete}
                variant="outlined"
                color="error"
                className="editdeck-delete-button"
                disabled={loading}
              >
                Delete Deck
              </Button>
            </div>
          </form>
        </div>
      </Fade>
    </div>
  );
}

export default EditDeck; 