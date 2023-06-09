/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-prototype-builtins */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Divider,
  Fade,
  FormControl,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import { QRCodeSVG } from 'qrcode.react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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

      const trxDateStr = data.trxDate.toString();
      const expDate = new Date(trxDateStr);
      const days = expDate.getDate();
      expDate.setDate(days + expDays);

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
            title={t('pages.initiativeDiscounts.authorizationRequestModalTitle')}
            subTitle={t('pages.newDiscount.createdSubtitle')}
            mbTitle={2}
            mtTitle={0}
            mbSubTitle={0}
            variantTitle="h6"
            variantSubTitle="body2"
          />
          <Box sx={{ gridColumn: 'span 12', my: 2 }}>
            <Alert color="info">
              {t('pages.newDiscount.expiringDiscountInfoAlertText', {
                days: expirationDays,
                hour: expirationTime,
                date: expirationDate,
              })}
            </Alert>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('pages.newDiscount.sendMagicLinkTitle')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, fontSize: '1rem' }}>
                {t('pages.newDiscount.sendMagicLinkSubtitle')}
              </Typography>
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
                {t('commons.copyLinkBtn')}
              </Button>
            </FormControl>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', my: 2 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Divider />
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('pages.newDiscount.sendQrTitle')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, fontSize: '1rem' }}>
                {t('pages.newDiscount.sendQrSubtitle')}
              </Typography>
              <Button
                startIcon={<FileDownloadIcon />}
                size="small"
                variant="contained"
                sx={{ height: '43px' }}
                onClick={() => downloadQRCode('qr-container', data?.trxCode)}
              >
                {t('commons.downloadQrBtn')}
              </Button>
            </Box>
            <Box sx={{ gridColumn: 'span 2', display: 'none' }}>
              <QRCodeSVG id="qr-container" value={magicLink || ''} />
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridColumn: 'span 2', justifyContent: 'end', mt: 5 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setOpenAuthorizeTrxModal(false);
              }}
            >
              {t('commons.closeBtn')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AuthorizeTransactionModal;
