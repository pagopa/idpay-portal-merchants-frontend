/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable functional/immutable-data */
/* eslint-disable no-prototype-builtins */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Alert, Box, Button, FormControl, Paper, TextField, Typography } from '@mui/material';
import { Toast } from '@pagopa/selfcare-common-frontend';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { TransactionResponse } from '../../api/generated/merchants/TransactionResponse';
import {
  copyTextToClipboard,
  downloadQRCodeFromURL,
  mapDataForDiscoutTimeRecap,
} from '../../helpers';
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [openCopySuccesToast, setOpenCopySuccesToast] = useState<boolean>(false);
  const [openDownloadSuccesToast, setOpenDownloadSuccesToast] = useState<boolean>(false);

  useEffect(() => {
    if (typeof data !== 'undefined') {
      const { expirationDays, expirationDate, expirationTime } = mapDataForDiscoutTimeRecap(
        data.trxExpirationMinutes,
        data.trxDate
      );
      setExpirationDays(expirationDays);
      setExpirationDate(expirationDate);
      setExpirationTime(expirationTime);
      setMagicLink(data?.qrcodeTxtUrl);
      setQrCodeUrl(data?.qrcodePngUrl);
    }
  }, [data]);

  return (
    <>
      <Toast
        open={openCopySuccesToast}
        title={t('pages.newDiscount.magicLinkCopied')}
        showToastCloseIcon={true}
        onCloseToast={() => setOpenCopySuccesToast(false)}
      />
      <Toast
        open={openDownloadSuccesToast}
        title={t('pages.newDiscount.qrCodeDownloaded')}
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
              data-testid="copy-link-buttton-test"
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
                downloadQRCodeFromURL(qrCodeUrl);
                setOpenDownloadSuccesToast(true);
              }}
              data-testid="download-qr-code-button-test"
            >
              {t('commons.downloadQrBtn')}
            </Button>
          </Box>
          <Box sx={{ gridColumn: 'span 2', justifySelf: 'end' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img src={qrCodeUrl} width="100%" />
            </Box>
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
