import React from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Button, Chip, DialogContent, Stack, Typography } from '@mui/material';
import {
  NotExcludedPointOfSaleDTO,
  PosOnboardingExclusionRejectionReason,
} from '../../api/generated/merchants/data-contracts';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import DialogComponent from '../../components/Dialog/DialogComponent';
import { getPointOfSaleFeedbackLabel, PointOfSaleFeedbackItem } from './pointOfSaleFeedbackUtils';

export type NotExcludedPointOfSale = NotExcludedPointOfSaleDTO & PointOfSaleFeedbackItem;

type Props = {
  stores: Array<NotExcludedPointOfSale>;
  isPartial: boolean;
  onClose: () => void;
};

const reasonChipSx = (reason: PosOnboardingExclusionRejectionReason) => {
  const isAlreadyExcluded = reason === PosOnboardingExclusionRejectionReason.ALREADY_EXCLUDED;
  const backgroundColor = isAlreadyExcluded ? '#FFF3CD' : '#E7EDFF';
  const color = isAlreadyExcluded ? '#8A6D1F' : '#173A79';

  return {
    flexShrink: 0,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${backgroundColor} !important`,
    color: `${color} !important`,
    fontWeight: theme.typography.fontWeightMedium,
    boxShadow: 'none',
    '& .MuiChip-label': {
      px: 1,
    },
  };
};

const PointOfSaleExclusionResultModal: React.FC<Props> = ({
  stores,
  isPartial,
  onClose,
}) => {
  const { t } = useScopedTranslation();

  if (stores.length === 0) {
    return null;
  }

  const titleKey = `pages.posCatalog.exclusionResultModal.${
    isPartial ? 'partialTitle' : 'notCompletedTitle'
  }`;
  const descriptionKey = 'pages.posCatalog.exclusionResultModal.notCompletedDescription';

  return (
    <DialogComponent
      open
      titleId="point-of-sale-exclusion-result-modal-title"
      dataTestId="point-of-sale-exclusion-result-modal"
      onClose={onClose}
      closeLabel={t('actions.close')}
      title={t(titleKey, { count: stores.length })}
      description={t(descriptionKey, { count: stores.length })}
      paperSx={{
        width: { xs: 'calc(100% - 32px)', sm: 608 },
      }}
      actionsSx={{ p: 3.5, pt: 2 }}
      actions={
        <Button size="small" variant="contained" onClick={onClose}>
          {t('actions.okClose')}
        </Button>
      }
    >
      <DialogContent sx={{ p: 3.5, pb: 0 }}>
        <Box sx={{ maxHeight: 150, overflowY: 'auto', overflowX: 'hidden', pr: 1 }}>
          {stores.map((pointOfSale) => (
            <Stack
              key={`${pointOfSale.pointOfSaleId}-${pointOfSale.reason}`}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
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
                  minWidth: 0,
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {getPointOfSaleFeedbackLabel(pointOfSale)}
              </Typography>
              <Chip
                size="small"
                variant="filled"
                label={t(`pages.posCatalog.exclusionResultModal.reasons.${pointOfSale.reason}`)}
                sx={reasonChipSx(pointOfSale.reason)}
              />
            </Stack>
          ))}
        </Box>
      </DialogContent>
    </DialogComponent>
  );
};

export default PointOfSaleExclusionResultModal;
