import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

type FeedbackDialogProps = {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  onClose: () => void;
  closeText?: string;
};

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  title = 'Ação concluída',
  message,
  onClose,
  closeText = 'OK',
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">{closeText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
