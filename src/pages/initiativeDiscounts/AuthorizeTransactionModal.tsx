/* eslint-disable no-prototype-builtins */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Alert, Backdrop, Box, Button, Fade, FormControl, Modal, TextField } from '@mui/material';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import { QRCodeSVG } from 'qrcode.react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { MerchantTransactionDTO } from '../../api/generated/merchants/MerchantTransactionDTO';
import { copyTextToClipboard, downloadQRCode } from '../../helpers';

type Props = {
  openAuthorizeTrxModal: boolean;
  setOpenAuthorizeTrxModal: Dispatch<SetStateAction<boolean>>;
  data: MerchantTransactionDTO;
};

const AuthorizeTransactionModal = ({
  openAuthorizeTrxModal,
  setOpenAuthorizeTrxModal,
  data,
}: Props) => {
  const [magicLink, setMagicLink] = useState<string>();
  const [expirationDays, setExpirationDays] = useState<number>();
  const [expirationDate, setExpirationDate] = useState<string>();
  const [expirationTime, setExpirationTime] = useState<string>();
  // const { t } = useTranslation();

  useEffect(() => {
    if (
      typeof data !== 'undefined' &&
      data.hasOwnProperty('trxExpirationMinutes') &&
      typeof data.trxExpirationMinutes === 'number' &&
      data.hasOwnProperty('trxDate') &&
      typeof data.trxDate === 'object'
    ) {
      const expDays = data?.trxExpirationMinutes / 1440;
      setExpirationDays(expDays);
      const t = data.trxDate.getDate();
      const expDate = new Date();
      expDate.setDate(t + expDays);
      const expDateStrArr = expDate
        .toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Europe/Rome',
          hour: 'numeric',
          minute: 'numeric',
        })
        .split(', ');
      setExpirationDate(expDateStrArr[0]);
      setExpirationTime(expDateStrArr[1]);
    }

    if (
      typeof data !== 'undefined' &&
      data.hasOwnProperty('trxCode') &&
      typeof data.trxCode === 'string'
    ) {
      setMagicLink(`https://www.idpay.it/authorizationlink/${data?.trxCode}`);
    }
  }, [data]);

  return (
    <Modal
      aria-labelledby="confirm-authorize-transaction-modal-title"
      aria-describedby="confirm-authorize-transaction-modal-description"
      open={openAuthorizeTrxModal}
      onClose={() => setOpenAuthorizeTrxModal(false)}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      data-testid="confirm-modal-authorize-trx"
    >
      <Fade in={openAuthorizeTrxModal} data-testid="fade-test">
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
          <TitleBox
            title={'Vuoi richiedere l’autorizzazione?'}
            subTitle={
              'Invia il buono sconto al tuo cliente, gli servirà per autorizzare la spesa con l’app IO.'
            }
            mbTitle={2}
            mtTitle={2}
            mbSubTitle={2}
            variantTitle="h6"
            variantSubTitle="body2"
          />
          <Box sx={{ gridColumn: 'span 12' }}>
            <Alert color="info">{`Il buono sconto ha una durata di ${expirationDays} giorni: è necessario autorizzare la spesa entro le ${expirationTime} del ${expirationDate}.`}</Alert>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Box sx={{ gridColumn: 'span 12', mb: 1, mt: 2 }}>
              <TitleBox
                title={'Invia un link magico'}
                subTitle={'Copia il link e invialo al tuo cliente con la modalità che preferisci.'}
                mbTitle={2}
                mtTitle={2}
                mbSubTitle={2}
                variantTitle="subtitle1"
                variantSubTitle="body2"
              />
            </Box>
            <FormControl sx={{ mr: 2, gridColumn: 'span 9' }}>
              <TextField disabled value={magicLink} size="small" id="magic-link" fullWidth />
            </FormControl>

            <FormControl sx={{ gridColumn: 'span 3' }}>
              <Button
                startIcon={<ContentCopyIcon />}
                size="small"
                variant="contained"
                sx={{ height: '43px' }}
                onClick={() => copyTextToClipboard(magicLink)}
              >
                Copia link
              </Button>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TitleBox
                title={'Oppure invia un codice QR'}
                subTitle={
                  'Salva l’immagine e inviala al tuo cliente con la modalità che preferisci.'
                }
                mbTitle={2}
                mtTitle={2}
                mbSubTitle={2}
                variantTitle="subtitle1"
                variantSubTitle="body2"
              />

              <Button
                startIcon={<FileDownloadIcon />}
                size="small"
                variant="contained"
                sx={{ height: '43px' }}
                onClick={() => downloadQRCode('qr-container', data?.trxCode)}
              >
                Scarica codice QR
              </Button>
            </Box>
            <Box sx={{ gridColumn: 'span 2', pt: 2, justifySelf: 'end', display: 'none' }}>
              <QRCodeSVG id="qr-container" value={magicLink || ''} />
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridColumn: 'span 2', justifyContent: 'end', pt: 4 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setOpenAuthorizeTrxModal(false);
              }}
            >
              Chiudi
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AuthorizeTransactionModal;
