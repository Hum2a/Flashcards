import React, { createContext, useContext, useState } from 'react';
import AlertModal from '../components/AlertModal';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK'
  });

  const showAlert = ({ title, message, type = 'info', onConfirm = null, confirmText = 'OK' }) => {
    setAlertState({
      open: true,
      title,
      message,
      type,
      onConfirm,
      confirmText
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, open: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModal
        open={alertState.open}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
} 