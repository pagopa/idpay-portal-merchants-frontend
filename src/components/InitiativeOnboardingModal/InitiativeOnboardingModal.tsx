import React from 'react';
import { Button, CircularProgress, DialogContent, Typography } from '@mui/material';
import DialogComponent from '../Dialog/DialogComponent';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { InitiativeForOnboarding } from '../../hooks/useInitiativeOnboarding';

type Props = {
  open: boolean;
  initiative: InitiativeForOnboarding | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * Confirmation modal for the "aderire a un'iniziativa" action.
 *
 * Renders a DialogComponent with:
 *  - Title: "Vuoi aderire a <initiativeName>?"
 *  - Optional body: initiative description (if provided)
 *  - Actions: "Annulla" + "Conferma"
 */
const InitiativeOnboardingModal: React.FC<Props> = ({
  open,
  initiative,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const { t } = useScopedTranslation();

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
      paperSx={{ minWidth: { xs: 'calc(100% - 32px)', sm: 480 } }}
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
      {initiative?.description ? (
        <DialogContent sx={{ px: 3.5, pt: 0, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {initiative.description}
          </Typography>
        </DialogContent>
      ) : null}
    </DialogComponent>
  );
};

export default InitiativeOnboardingModal;

