import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { ToastContext } from './toastBase';
import type { Severity } from './toastBase';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<Severity>('info');
  const [duration, setDuration] = React.useState<number | undefined>(3000);

  const showToast = ({ message, severity = 'info', autoHideDuration }: { message: string; severity?: Severity; autoHideDuration?: number }) => {
    setMessage(message);
    setSeverity(severity);
    setDuration(autoHideDuration ?? 3000);
    setOpen(true);
  };

  const handleClose = (_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar open={open} onClose={handleClose} autoHideDuration={duration} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
