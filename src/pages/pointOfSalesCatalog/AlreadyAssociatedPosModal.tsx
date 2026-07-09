import React from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Button, DialogContent, Typography } from '@mui/material';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { formatAlreadyAssociatedAddress } from '../../utils/addressUtils';
import DialogComponent from '../../components/Dialog/DialogComponent';

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
  initiativeName?: string;
  showStores?: boolean;
  onClose: () => void;
};

const getAlreadyAssociatedPointOfSaleDetail = (pointOfSale: AlreadyAssociatedPointOfSale) =>
  pointOfSale.type === 'ONLINE' ? pointOfSale.website : formatAlreadyAssociatedAddress(pointOfSale);

const AlreadyAssociatedPosModal: React.FC<Props> = ({
  stores,
  initiativeName,
  showStores = true,
  onClose,
}) => {
  const { t } = useScopedTranslation();

  if (stores.length === 0) {
    return null;
  }

  return (
    <DialogComponent
      open
      titleId="already-associated-pos-modal-title"
      dataTestId="already-associated-pos-modal"
      onClose={onClose}
      closeLabel={t('actions.close')}
      title={t(
        showStores
          ? 'pages.posCatalog.alreadyAssociatedModal.title'
          : 'pages.posCatalog.alreadyAssociatedModal.allAlreadyAssociatedTitle',
        { count: stores.length }
      )}
      description={t(
        showStores
          ? 'pages.posCatalog.alreadyAssociatedModal.description'
          : 'pages.posCatalog.alreadyAssociatedModal.allAlreadyAssociatedDescription',
        { count: stores.length, initiativeName }
      )}
      paperSx={{
        width: { xs: 'calc(100% - 32px)', sm: '40%' },
      }}
      actionsSx={{ p: 3.5, pt: 2 }}
      actions={
        <Button size="small" variant="contained" onClick={onClose}>
          {t('actions.okClose')}
        </Button>
      }
    >
      {showStores ? (
        <DialogContent sx={{ p: 3.5, pb: 0 }}>
          <Box sx={{ maxHeight: 150, overflowY: 'auto', overflowX: 'hidden', pr: 1 }}>
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
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    display: 'block',
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {[pointOfSale.pointOfSaleName, getAlreadyAssociatedPointOfSaleDetail(pointOfSale)]
                    .filter(Boolean)
                    .join(' - ')}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      ) : undefined}
    </DialogComponent>
  );
};

export default AlreadyAssociatedPosModal;
