import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface ModalReportedUserProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  cfModal?: string;
  descriptionTwo?: string;
}

const ModalReportedUser: React.FC<ModalReportedUserProps> = ({
  open,
  title,
  description,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  descriptionTwo,
}) => (
  <Dialog open={open} onClose={onCancel} PaperProps={{ style: { minWidth: 600, minHeight: 267 } }}>
    <DialogTitle
      sx={{
        fontFamily: '"Titillium Web", sans-serif',
        fontWeight: 700,
        fontStyle: 'bold',
        fontSize: '24px',
        lineHeight: '32px',
        letterSpacing: '0px',
        mt: 2,
      }}
    >
      {title}
    </DialogTitle>
    <DialogContent>
      <Typography>{description}</Typography>
      {descriptionTwo && <Typography>{descriptionTwo}</Typography>}
    </DialogContent>
    <DialogActions sx={{ mb: 3, mr: 3 }}>
      <Button variant="outlined" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button variant="contained" color="primary" onClick={onConfirm}>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ModalReportedUser;
