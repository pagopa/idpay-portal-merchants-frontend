import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';

type Props = {
  open: boolean;
  titleId: string;
  title: string;
  description: string;
  closeLabel: string;
  onClose: () => void;
  dataTestId?: string;
  paperSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  showCloseIcon?: boolean;
};

const DialogComponent: React.FC<Props> = ({
  open,
  titleId,
  title,
  description,
  closeLabel,
  onClose,
  dataTestId,
  paperSx,
  actionsSx,
  actions,
  children,
  showCloseIcon = true,
}) => {
  if (!open) {
    return null;
  }

  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby={titleId}
      data-testid={dataTestId}
      PaperProps={{
        sx: {
          maxWidth: 'calc(100% - 32px)',
          borderRadius: 2,
          ...paperSx,
        },
      }}
    >
      <DialogTitle id={titleId} sx={{ px: 3.5, pt: 2.5, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: theme.typography.fontWeightBold, mb: 0.75 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          {showCloseIcon && (
            <IconButton aria-label={closeLabel} onClick={onClose} sx={{ mr: -1 }}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>

      {children}

      {actions && <DialogActions sx={actionsSx}>{actions}</DialogActions>}
    </Dialog>
  );
};

export default DialogComponent;
