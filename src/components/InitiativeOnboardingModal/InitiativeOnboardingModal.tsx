import React from 'react';
import { Button, CircularProgress, DialogContent, Typography } from '@mui/material';
import DialogComponent from '../Dialog/DialogComponent';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { InitiativeForOnboarding } from '../../hooks/useInitiativeOnboarding';

const ONBOARDING_BODY_MESSAGES: Record<string, string> = {
  'bonus decoder':
    'Bonus Decoder è un contributo pubblico del Ministero delle Imprese e del Made in Italy che permette ai consumatori di acquistare un decoder DVB-T2 (terrestre) o DVB-S2 (satellitare) con uno sconto diretto applicato dal rivenditore.',
  'bonus elettrodomestici':
    'Bonus Elettrodomestici è il contributo, erogato dal Ministero delle Imprese e del Made in Italy, per incentivare la sostituzione di un elettrodomestico con un modello ad alta efficienza energetica e promuovere la sostenibilità e la transizione energetica ai sensi del Decreto del Ministro delle Imprese e del Made in Italy di concerto con il Ministero dell’Economia e delle Finanze 3 settembre 2025, ammesso alla registrazione dalla Corte dei conti in data 18 settembre 2025, al n. 1146.',
};

const getOnboardingBodyMessage = (initiative: InitiativeForOnboarding | null) => {
  const normalizedInitiativeName = initiative?.initiativeName.trim().toLocaleLowerCase();

  if (!normalizedInitiativeName) {
    return '';
  }

  return ONBOARDING_BODY_MESSAGES[normalizedInitiativeName] ??
    initiative?.description ??
    'Stai per aderire al bonus selezionato. Clicca su conferma per completare l\'adesione.';
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
            {bodyMessage}
          </Typography>
        </DialogContent>
      ) : null}
    </DialogComponent>
  );
};

export default InitiativeOnboardingModal;
