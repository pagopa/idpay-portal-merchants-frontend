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
  description: string;
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
  cfModal,
  descriptionTwo,
}) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      {cfModal && (
        <Typography fontWeight="bold" gutterBottom>
          {cfModal}
        </Typography>
      )}
      <Typography>{description}</Typography>
      {descriptionTwo && <Typography sx={{ mt: 1 }}>{descriptionTwo}</Typography>}
    </DialogContent>
    <DialogActions>
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
