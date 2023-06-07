/* eslint-disable functional/immutable-data */
/* eslint-disable no-prototype-builtins */
import { Paper, Box, Alert, FormControl, TextField, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { QRCodeSVG } from 'qrcode.react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TransactionResponse } from '../../api/generated/merchants/TransactionResponse';
import { BASE_ROUTE } from '../../routes';
import { copyTextToClipboard, downloadQRCode } from '../../helpers';

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
    <>
      <Box sx={{ gridColumn: 'span 12', my: 5 }}>
        <Alert color="info">
          {t('pages.newDiscount.expiringDiscountInfoAlertText', {
            days: expirationDays,
            hour: expirationTime,
            date: expirationDate,
          })}
        </Alert>
      </Box>
      <Paper sx={{ gridColumn: 'span 12', p: 3 }}>
        <TitleBox
          title={t('pages.newDiscount.sendMagicLinkTitle')}
          subTitle={t('pages.newDiscount.sendMagicLinkSubtitle')}
          mbTitle={2}
          mtTitle={0}
          mbSubTitle={3}
          variantTitle="h6"
          variantSubTitle="body2"
        />
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
              onClick={() => copyTextToClipboard(magicLink)}
            >
              {t('commons.copyLinkBtn')}
            </Button>
          </FormControl>
        </Box>
      </Paper>
      <Paper sx={{ gridColumn: 'span 12', my: 5, p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <Box sx={{ gridColumn: 'span 10' }}>
            <TitleBox
              title={t('pages.newDiscount.sendQrTitle')}
              subTitle={t('pages.newDiscount.sendQrSubtitle')}
              mbTitle={2}
              mtTitle={0}
              mbSubTitle={3}
              variantTitle="h6"
              variantSubTitle="body2"
            />
            <Button
              startIcon={<FileDownloadIcon />}
              size="small"
              variant="contained"
              onClick={() => downloadQRCode('qr-container', data?.trxCode)}
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
