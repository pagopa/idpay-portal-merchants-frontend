import { Backdrop, Box, Button, Fade, Modal, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
// import { useHistory } from 'react-router-dom';
import { StatusEnum as TransactionStatusEnum } from '../../api/generated/merchants/MerchantTransactionDTO';
import { deleteTransaction } from '../../services/merchantService';
// import { BASE_ROUTE } from '../../routes';

type Props = {
  openCancelTrxModal: boolean;
  setOpenCancelTrxModal: Dispatch<SetStateAction<boolean>>;
  initiativeId: string;
  trxId: string;
  status: TransactionStatusEnum;
};

const CancelTransactionModal = ({
  openCancelTrxModal,
  setOpenCancelTrxModal,
  trxId,
  status,
}: Props) => {
  const { t } = useTranslation();
  const addError = useErrorDispatcher();
  // const history = useHistory();

  const handleCancelTransaction = (trxId: string) => {
    deleteTransaction(trxId)
      .then((_res) => {
        // history.replace(`${BASE_ROUTE}/sconti-iniziativa/${initiativeId}`);
        window.location.reload();
      })
      .catch((error) => {
        addError({
          id: 'DELETE_TRANSACTION_ERROR',
          blocking: false,
          error,
          techDescription: 'An error occurred deleting a transaction',
          displayableTitle: t('errors.title'),
          displayableDescription: t('errors.getDataDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
  };

  return (
    <Modal
      aria-labelledby="confirm-cancel-transaction-modal-title"
      aria-describedby="confirm-cancel-transaction-modal-description"
      open={openCancelTrxModal}
      onClose={() => setOpenCancelTrxModal(false)}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      data-testid="confirm-modal-cancel-trx"
    >
      <Fade in={openCancelTrxModal} data-testid="fade-test">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            borderRadius: '4px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6">Vuoi annullare il buono sconto?</Typography>
          <Typography variant="body1" sx={{ my: 2 }}>
            {status === TransactionStatusEnum.AUTHORIZED
              ? 'Il buono sconto è già stato autorizzato, se decidi di annullarlo l’importo verrà riaccreditato sull’iniziativa del cittadino e il rimborso da parte dell’Ente non verrà avviato.'
              : 'Il buono sconto non è ancora stato autorizzato, se decidi di annullarlo il link magico e il codice QR smetteranno di funzionare e non sarà più possibile per il cittadino procedere con l’autorizzazione.'}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gridTemplateRows: 'auto',
              gridTemplateAreas: `". . backBtn backBtn backBtn cancelTrxBtn cancelTrxBtn cancelTrxBtn"`,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              sx={{ gridArea: 'backBtn', mr: 1, justifySelf: 'end' }}
              onClick={() => setOpenCancelTrxModal(false)}
              data-testid="cancel-button-test"
            >
              Torna indietro
            </Button>
            <Button
              variant="contained"
              sx={{ gridArea: 'cancelTrxBtn', justifySelf: 'end' }}
              onClick={() => {
                handleCancelTransaction(trxId);
                setOpenCancelTrxModal(false);
              }}
              data-testid="publish-button-test"
            >
              {t('pages.initiativeDiscounts.cancelDiscount')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CancelTransactionModal;