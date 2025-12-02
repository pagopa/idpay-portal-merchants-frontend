import { Backdrop, Box, Button, Fade, Modal, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusEnum as TransactionStatusEnum } from '../../api/generated/merchants/MerchantTransactionDTO';
import { deleteTransaction } from '../../services/merchantService';
import { useAlert } from '../../hooks/useAlert';

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
  const {setAlert} = useAlert();
  const { t } = useTranslation();

  const handleCancelTransaction = (trxId: string) => {
    deleteTransaction(trxId)
      .then((_res) => {
        window.location.reload();
      })
      .catch(() => {
        setAlert({title: t('errors.genericTitle'), text: t('errors.genericDescription'), isOpen: true, severity: 'error'});
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
          <Typography variant="h6">
            {t('pages.initiativeDiscounts.cancelDiscountModalTitle')}
          </Typography>
          <Typography variant="body1" sx={{ my: 2 }}>
            {status === TransactionStatusEnum.AUTHORIZED
              ? t('pages.initiativeDiscounts.cancelDiscountAuthorizedModalBody')
              : t('pages.initiativeDiscounts.cancelDiscountNotAuthorizedModalBody')}
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
              data-testid="modal-cancel-back-button-test"
            >
              {t('commons.cancelBtn')}
            </Button>
            <Button
              variant="contained"
              sx={{ gridArea: 'cancelTrxBtn', justifySelf: 'end' }}
              onClick={() => {
                handleCancelTransaction(trxId);
                setOpenCancelTrxModal(false);
              }}
              data-testid="modal-cancel-button-test"
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
