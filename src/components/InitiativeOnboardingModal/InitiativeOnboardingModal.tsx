import React from 'react';
import { Button, CircularProgress, DialogContent, Typography } from '@mui/material';
import DialogComponent from '../Dialog/DialogComponent';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { InitiativeForOnboarding } from '../../hooks/useInitiativeOnboarding';
import bonusDecoder2026Copy from '../../locale/it/bonusDecoder2026/copy.json';
import bonusElettrodomestici2025Copy from '../../locale/it/bonusElettrodomestici2025/copy.json';
import bonusDefaultCopy from '../../locale/it/default/copy.json';

const ONBOARDING_BODY_MESSAGES: Record<string, string> = {
  'bonus decoder': bonusDecoder2026Copy.pages.initiativesList.onboardingModal.description,
  'bonus elettrodomestici': bonusElettrodomestici2025Copy.pages.initiativeOverview.info.description,
};

const getOnboardingBodyMessage = (initiative: InitiativeForOnboarding | null) => {
  const normalizedInitiativeName = initiative?.initiativeName.trim().toLocaleLowerCase();

  if (!normalizedInitiativeName) {
    return '';
  }

  return ONBOARDING_BODY_MESSAGES[normalizedInitiativeName] ??
    initiative?.description ?? bonusDefaultCopy.pages.initiativesList.onboardingModal.description;
};

type Props = {
  open: boolean;
  initiative: InitiativeForOnboarding | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const InitiativeOnboardingModal: React.FC<Props> = ({
  open,
  initiative,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const { t } = useScopedTranslation();
  const bodyMessage = getOnboardingBodyMessage(initiative);

  return (
    <DialogComponent
      open={open}
      titleId="initiative-onboarding-dialog-title"
      title={t('pages.initiativesList.onboarding.modalTitle', {
        initiativeName: initiative?.initiativeName ?? '',
      })}
      description=""
      closeLabel={t('actions.cancel')}
      onClose={onClose}
      showCloseIcon
      dataTestId="initiative-onboarding-modal"
      paperSx={{ width: { xs: 'calc(100% - 32px)', md: '39.0625%' } }}
      actionsSx={{ px: 3.5, pb: 2.5, pt: 1 }}
      actions={
        <>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
            data-testid="onboarding-cancel-btn"
          >
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            data-testid="onboarding-confirm-btn"
          >
            {t('actions.confirm')}
          </Button>
        </>
      }
    >
      {bodyMessage ? (
        <DialogContent sx={{ px: 3.5, pt: 0, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t(bodyMessage)}
          </Typography>
        </DialogContent>
      ) : null}
    </DialogComponent>
  );
};

export default InitiativeOnboardingModal;
