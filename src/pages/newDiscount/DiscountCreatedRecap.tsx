/* eslint-disable functional/immutable-data */
/* eslint-disable no-prototype-builtins */
import { Paper, Box, Alert, FormControl, TextField, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { QRCodeSVG } from 'qrcode.react';
import { useHistory } from 'react-router-dom';
import { TransactionResponse } from '../../api/generated/merchants/TransactionResponse';
import { BASE_ROUTE } from '../../routes';

interface Props {
  data: TransactionResponse | undefined;
}

const DiscountCreatedRecap = ({ data }: Props) => {
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

  const copyTextToClipboard = () => {
    if (typeof magicLink === 'string') {
      void navigator.clipboard.writeText(magicLink);
    }
  };

  const downloadQRCode = () => {
    const content = document.getElementById('qr-container');
    if (content !== null) {
      content.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const svgData = content.outerHTML;
      const preface = '<?xml version="1.0" standalone="no"?>\r\n';
      const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'QRCode.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <>
      <Box sx={{ gridColumn: 'span 12' }}>
        <Alert color="info">{`Il buono sconto ha una durata di ${expirationDays} giorni: è necessario autorizzare la spesa entro le ${expirationTime} del ${expirationDate}.`}</Alert>
      </Box>
      <Paper sx={{ gridColumn: 'span 12', mt: 2, mb: 4, px: 3, pb: 3 }}>
        <TitleBox
          title={'Invia un link magico'}
          subTitle={'Copia il link e invialo al tuo cliente con la modalità che preferisci.'}
          mbTitle={2}
          mtTitle={2}
          mbSubTitle={2}
          variantTitle="h6"
          variantSubTitle="body2"
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <Box sx={{ gridColumn: 'span 12', mb: 1 }}>
            <Typography variant="subtitle1">Link magico</Typography>
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
              onClick={copyTextToClipboard}
            >
              Copia link
            </Button>
          </FormControl>
        </Box>
      </Paper>
      <Paper sx={{ gridColumn: 'span 12', mt: 2, mb: 4, px: 3, pb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <Box sx={{ gridColumn: 'span 10' }}>
            <TitleBox
              title={'Oppure invia un codice QR'}
              subTitle={'Salva l’immagine e inviala al tuo cliente con la modalità che preferisci.'}
              mbTitle={2}
              mtTitle={2}
              mbSubTitle={2}
              variantTitle="h6"
              variantSubTitle="body2"
            />

            <Button
              startIcon={<FileDownloadIcon />}
              size="small"
              variant="contained"
              sx={{ height: '43px' }}
              onClick={downloadQRCode}
            >
              Scarica codice QR
            </Button>
          </Box>
          <Box sx={{ gridColumn: 'span 2', pt: 2, justifySelf: 'end' }}>
            <QRCodeSVG id="qr-container" value={magicLink || ''} />
          </Box>
        </Box>
      </Paper>
      <Box sx={{ gridColumn: 'span 12' }}>
        <Button
          variant="outlined"
          onClick={() => history.replace(`${BASE_ROUTE}/sconti-iniziativa/${data?.initiativeId}`)}
        >
          Gestisci buoni sconto
        </Button>
      </Box>
    </>
  );
};

export default DiscountCreatedRecap;
