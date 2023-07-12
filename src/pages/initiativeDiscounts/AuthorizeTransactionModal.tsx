/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-prototype-builtins */
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Fade,
  FormControl,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MerchantTransactionDTO } from '../../api/generated/merchants/MerchantTransactionDTO';
import {
  copyTextToClipboard,
  downloadQRCodeFromURL,
  formatDate,
  formattedCurrency,
  mapDataForDiscoutTimeRecap,
} from '../../helpers';
import { renderTransactionCreatedStatus } from './helpers';

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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [expirationDays, setExpirationDays] = useState<number>();
  const [expirationDate, setExpirationDate] = useState<string>();
  const [expirationTime, setExpirationTime] = useState<string>();
  const { t } = useTranslation();

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
            top: '0',
            right: '0',
            transform: 'translate(0, 0)',
            width: '375px',
            height: '100%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              justifyItems: 'end',
              mb: 4,
            }}
          >
            <Box sx={{ gridColumn: 'span 12' }}>
              <IconButton
                color="default"
                aria-label="close authorize transaction modal"
                component="span"
                onClick={() => {
                  setOpenAuthorizeTrxModal(false);
                }}
              >
                <CloseIcon data-testid="close-authorize-transaction-modal-test" />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              justifyItems: 'start',
              height: 'calc(100% - 100px)',
              overflow: 'auto',
            }}
          >
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('pages.initiativeDiscounts.detailTitle')}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 12', my: 2 }}>
              <Alert color="info">
                {t('pages.newDiscount.expiringDiscountInfoAlertText', {
                  days: expirationDays,
                  hour: expirationTime,
                  date: expirationDate,
                })}
              </Alert>
            </Box>
            <Box sx={{ gridColumn: 'span 12', mt: 2, mb: 1 }}>
              <Typography variant="body2">{t('pages.initiativeDiscounts.dateAndHours')}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDate(data.trxDate)}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 12', mt: 2, mb: 1 }}>
              <Typography variant="body2">{t('pages.initiativeDiscounts.totalSpent')}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formattedCurrency(data.effectiveAmount, '-', true)}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 12', mt: 2, mb: 1 }}>
              <Typography variant="body2">
                {t('pages.initiativeDiscounts.discountStatus')}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>{renderTransactionCreatedStatus(data.status)}</Box>

            <Box sx={{ gridColumn: 'span 12', mt: 3, mb: 2 }}>
              <Typography variant="h6">{t('pages.newDiscount.magicLinkLabel')}</Typography>
            </Box>

            <FormControl
              sx={{
                mb: 1,
                gridColumn: 'span 12',
                width: '100%',
              }}
            >
              <TextField disabled value={magicLink} size="small" id="magic-link" />
            </FormControl>
            <FormControl sx={{ gridColumn: 'span 5' }}>
              <Button
                startIcon={<ContentCopyIcon />}
                size="small"
                variant="contained"
                onClick={() => copyTextToClipboard(magicLink)}
              >
                {t('commons.copyLinkBtn')}
              </Button>
            </FormControl>

            <Box sx={{ gridColumn: 'span 12', mt: 3, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('pages.newDiscount.qrCodeLabel')}
              </Typography>
              <Button
                startIcon={<FileDownloadIcon />}
                size="small"
                variant="contained"
                onClick={() => downloadQRCodeFromURL(qrCodeUrl)}
              >
                {t('commons.downloadQrBtn')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AuthorizeTransactionModal;
