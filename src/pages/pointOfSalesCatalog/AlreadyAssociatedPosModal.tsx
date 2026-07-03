import React from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useScopedTranslation from '../../hooks/useScopedTranslation';

export type AlreadyAssociatedPointOfSale = {
  pointOfSaleId?: string;
  pointOfSaleName?: string;
  type?: 'PHYSICAL' | 'ONLINE' | string;
  address?: string | null;
  city?: string | null;
  streetNumber?: string | null;
  website?: string | null;
};

type Props = {
  stores: Array<AlreadyAssociatedPointOfSale>;
  onClose: () => void;
};

const getPhysicalPointOfSaleDetail = (pointOfSale: AlreadyAssociatedPointOfSale) =>
  [
    [pointOfSale.address, pointOfSale.streetNumber].filter(Boolean).join(' '),
    pointOfSale.city,
  ]
    .filter(Boolean)
    .join(', ');

const getAlreadyAssociatedPointOfSaleDetail = (pointOfSale: AlreadyAssociatedPointOfSale) =>
  pointOfSale.type === 'ONLINE' ? pointOfSale.website : getPhysicalPointOfSaleDetail(pointOfSale);

const AlreadyAssociatedPosModal: React.FC<Props> = ({ stores, onClose }) => {
  const { t } = useScopedTranslation();

  if (stores.length === 0) {
    return null;
  }

  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="already-associated-pos-modal-title"
      data-testid="already-associated-pos-modal"
      PaperProps={{
        sx: {
          width: { xs: 'calc(100% - 32px)', sm: '40%' },
          maxWidth: 'calc(100% - 32px)',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle id="already-associated-pos-modal-title" sx={{ px: 3.5, pt: 3, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: theme.typography.fontWeightBold, mb: 0.75 }}>
              {t('pages.posCatalog.alreadyAssociatedModal.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pages.posCatalog.alreadyAssociatedModal.description')}
            </Typography>
          </Box>
          <IconButton aria-label={t('actions.close')} onClick={onClose} sx={{ mr: -1 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3.5, pb: 0 }}>
        <Box sx={{ maxHeight: 150, overflowY: 'auto', pr: 1 }}>
          {stores.map((pointOfSale) => (
            <Box
              key={pointOfSale.pointOfSaleId}
              sx={{
                py: 1.35,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-of-type': {
                  borderBottom: 'none',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {[pointOfSale.pointOfSaleName, getAlreadyAssociatedPointOfSaleDetail(pointOfSale)]
                  .filter(Boolean)
                  .join(' - ')}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3.5, pt: 2 }}>
        <Button size="small" variant="contained" onClick={onClose}>
          {t('actions.okClose')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlreadyAssociatedPosModal;
