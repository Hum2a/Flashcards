import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Fade,
  Grow
} from '@mui/material';
import '../styles/AlertModal.css';

function AlertModal({ open, onClose, title, message, confirmText = "OK", onConfirm, type = "info" }) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={`alert-modal ${type}`}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        className: 'alert-modal-paper'
      }}
    >
      <Grow in={open} timeout={300}>
        <div>
          <DialogTitle className="alert-modal-title">
            {title}
          </DialogTitle>
          <DialogContent>
            <Typography className="alert-modal-message">
              {message}
            </Typography>
          </DialogContent>
          <DialogActions className="alert-modal-actions">
            <Button 
              onClick={onClose} 
              className="alert-modal-cancel-button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="alert-modal-confirm-button"
              autoFocus
            >
              {confirmText}
            </Button>
          </DialogActions>
        </div>
      </Grow>
    </Dialog>
  );
}

export default AlertModal; 