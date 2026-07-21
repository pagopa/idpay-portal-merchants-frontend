import React from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Button, DialogContent, Tooltip, Typography } from '@mui/material';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import DialogComponent from '../../components/Dialog/DialogComponent';
import { getPointOfSaleFeedbackLabel, PointOfSaleFeedbackItem } from './pointOfSaleFeedbackUtils';

export type AlreadyAssociatedPointOfSale = PointOfSaleFeedbackItem & {
  pointOfSaleId?: string;
  franchiseName?: string;
};

type Props = {
  stores: Array<AlreadyAssociatedPointOfSale>;
  initiativeName?: string;
  showStores?: boolean;
  onClose: () => void;
};

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
      title={t('pages.posCatalog.alreadyAssociatedModal.title', { count: stores.length })}
      description={t('pages.posCatalog.alreadyAssociatedModal.description', { count: stores.length, initiativeName })}
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
            {stores.map((pointOfSale) => {
              const label = getPointOfSaleFeedbackLabel(pointOfSale);

              return (
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
                  <Tooltip title={label} placement="bottom">
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
                      {label}
                    </Typography>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      ) : undefined}
    </DialogComponent>
  );
};

export default AlreadyAssociatedPosModal;
