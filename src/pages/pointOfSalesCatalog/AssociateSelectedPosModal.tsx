import React from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MIAlert } from '@pagopa/mui-italia';
import useScopedTranslation from '../../hooks/useScopedTranslation';

type InitiativeOption = {
  value: string;
  label: string;
};

type Props = {
  open: boolean;
  initiativeOptions: Array<InitiativeOption>;
  selectedInitiativeId: string;
  isLoading: boolean;
  onClose: () => void;
  onInitiativeChange: (initiativeId: string) => void;
  onConfirm: () => void;
};

const AssociateSelectedPosModal: React.FC<Props> = ({
  open,
  initiativeOptions,
  selectedInitiativeId,
  isLoading,
  onClose,
  onInitiativeChange,
  onConfirm,
}) => {
  const { t } = useScopedTranslation();

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="associate-selected-pos-modal-title"
      data-testid="associate-selected-pos-modal"
      PaperProps={{
        sx: {
          width: { xs: 'calc(100% - 32px)', sm: 608 },
          maxWidth: 'calc(100% - 32px)',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle id="associate-selected-pos-modal-title" sx={{ px: 3.5, py: 3, pb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: theme.typography.fontWeightBold }}>
              {t('pages.posCatalog.associateModal.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pages.posCatalog.associateModal.description')}
            </Typography>
          </Box>
          <IconButton aria-label={t('actions.close')} onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormControl fullWidth size="small" sx={{mt: 2.5}}>
          <InputLabel id="associate-initiative-label">
            {t('pages.posCatalog.associateModal.initiativeLabel')}{' '}
            <Box component="span" sx={{ color: theme.palette.error.main }}>
              *
            </Box>
          </InputLabel>
          <Select
            labelId="associate-initiative-label"
            value={selectedInitiativeId}
            label={t('pages.posCatalog.associateModal.initiativeLabel')}
            onChange={(event) => onInitiativeChange(event.target.value)}
            sx={{
              '& .MuiSelect-select': {
                py: 1.25,
              },
            }}
          >
            {initiativeOptions.map((initiative) => (
              <MenuItem key={initiative.value} value={initiative.value}>
                {initiative.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <MIAlert severity="info" description={t('pages.posCatalog.associateModal.infoBanner')} />
      </DialogContent>

      <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 0 }}>
        <Button size="small" onClick={onClose}>
          {t('actions.cancel')}
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onConfirm}
          disabled={!selectedInitiativeId || isLoading}
        >
          {t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssociateSelectedPosModal;
