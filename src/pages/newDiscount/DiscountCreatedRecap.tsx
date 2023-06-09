/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable functional/immutable-data */
/* eslint-disable no-prototype-builtins */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Alert, Box, Button, FormControl, Paper, TextField, Typography } from '@mui/material';
import { Toast } from '@pagopa/selfcare-common-frontend';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { TransactionResponse } from '../../api/generated/merchants/TransactionResponse';
import { copyTextToClipboard, downloadQRCode } from '../../helpers';
import { BASE_ROUTE } from '../../routes';

interface Props {
  data: TransactionResponse | undefined;
}

const DiscountCreatedRecap = ({ data }: Props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [expirationDays, setExpirationDays] = useState<number>();
  const [expirationDate, setExpirationDate] = useState<string>();
  const [expirationTime, setExpirationTime] = useState<string>();
  const [magicLink, setMagicLink] = useState<string>();
  const [openCopySuccesToast, setOpenCopySuccesToast] = useState<boolean>(false);
  const [openDownloadSuccesToast, setOpenDownloadSuccesToast] = useState<boolean>(false);

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
    <>
      <Toast
        open={openCopySuccesToast}
        title={'Link Copiato'}
        showToastCloseIcon={true}
        onCloseToast={() => setOpenCopySuccesToast(false)}
      />
      <Toast
        open={openDownloadSuccesToast}
        title={'Codice QR scaricato'}
        showToastCloseIcon={true}
        onCloseToast={() => setOpenDownloadSuccesToast(false)}
      />
      <Box sx={{ gridColumn: 'span 12', mt: 2, mb: 5 }}>
        <Alert color="info">
          {t('pages.newDiscount.expiringDiscountInfoAlertText', {
            days: expirationDays,
            hour: expirationTime,
            date: expirationDate,
          })}
        </Alert>
      </Box>
      <Paper sx={{ gridColumn: 'span 12', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('pages.newDiscount.sendMagicLinkTitle')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, fontSize: '1rem' }}>
          {t('pages.newDiscount.sendMagicLinkSubtitle')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <Box sx={{ gridColumn: 'span 12', mb: 1 }}>
            <Typography variant="subtitle1">{t('pages.newDiscount.magicLinkLabel')}</Typography>
          </Box>
          <FormControl sx={{ mr: 2, gridColumn: 'span 6' }}>
            <TextField disabled value={magicLink} size="small" id="magic-link" fullWidth />
          </FormControl>
          <FormControl sx={{ gridColumn: 'span 2' }}>
            <Button
              startIcon={<ContentCopyIcon />}
              size="small"
              variant="contained"
              sx={{ height: '43px' }}
              onClick={() => {
                copyTextToClipboard(magicLink);
                setOpenCopySuccesToast(true);
              }}
            >
              {t('commons.copyLinkBtn')}
            </Button>
          </FormControl>
        </Box>
      </Paper>
      <Paper sx={{ gridColumn: 'span 12', my: 5, p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <Box sx={{ gridColumn: 'span 10' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('pages.newDiscount.sendQrTitle')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, fontSize: '1rem' }}>
              {t('pages.newDiscount.sendQrSubtitle')}
            </Typography>
            <Button
              startIcon={<FileDownloadIcon />}
              size="small"
              variant="contained"
              sx={{ height: '43px' }}
              onClick={() => {
                downloadQRCode('qr-container', data?.trxCode);
                setOpenDownloadSuccesToast(true);
              }}
            >
              {t('commons.downloadQrBtn')}
            </Button>
          </Box>
          <Box sx={{ gridColumn: 'span 2', justifySelf: 'end' }}>
            <QRCodeSVG id="qr-container" value={magicLink || ''} />
          </Box>
        </Box>
      </Paper>
      <Box sx={{ gridColumn: 'span 12' }}>
        <Box sx={{ display: 'flex' }}>
          <Box>
            <Button
              variant="outlined"
              onClick={() =>
                history.replace(`${BASE_ROUTE}/sconti-iniziativa/${data?.initiativeId}`)
              }
            >
              {t('pages.newDiscount.handleDiscountsBtn')}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DiscountCreatedRecap;
