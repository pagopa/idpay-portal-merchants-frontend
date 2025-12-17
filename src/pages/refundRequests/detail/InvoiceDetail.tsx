import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import { ReactNode, useEffect, useState} from 'react';
import { theme } from '@pagopa/mui-italia';
import { ReceiptLong } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {  useLocation } from 'react-router-dom';
import { downloadInvoiceFile,postponeTransaction } from '../../../services/merchantService';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { formatValues, currencyFormatter,getEndOfNextMonth} from '../../../utils/formatUtils';
import StatusChipInvoice from '../../../components/Chip/StatusChipInvoice';
import { RewardBatchTrxStatusEnum } from '../../../api/generated/merchants/RewardBatchTrxStatus';
import { useAlert } from '../../../hooks/useAlert';
import ModalComponent from '../../../components/modal/ModalComponent';
import { intiativesListSelector} from '../../../redux/slices/initiativesSlice';
import { useAppSelector } from '../../../redux/hooks';


type Props = {
  title?: string;
  itemValues: any;
  listItem: Array<any>;
  batchId: string ;
  storeId: string;
  children?: ReactNode;
  onCloseDrawer?: () => void;
  onSuccess?: () => void;
};

export default function InvoiceDetail({ title, itemValues, listItem ,batchId, onCloseDrawer, onSuccess}: Props) {
  const { setAlert } = useAlert();
  const [isLoading, setLoading] = useState(false);
  const [initiativeEndDate, setInitiativeEndDate] = useState<string>('');
  const [nextMonthInitiativeEndDate, setNextMonthInitiativeEndDate] = useState<Date | undefined>();
  const [initiativeId, setInitiativeId] = useState<string >('');
  const [invoiceTransactionModal, setInvoiceTransactionModal] = useState(false);
  const location = useLocation<{ store: any}>();
  const batchMonth = location.state?.store?.month;
  const statusBatch = location.state?.store?.status;
  const { t } = useTranslation();
  const initiativesListSel = useAppSelector(intiativesListSelector);

  useEffect(() => {
    if (initiativesListSel?.[0]?.endDate && initiativesListSel?.[0]?.endDate.toISOString().split('T')[0]) {
      const endOfNextMonth = getEndOfNextMonth(initiativesListSel?.[0]?.endDate);
      setNextMonthInitiativeEndDate(endOfNextMonth);
      setInitiativeEndDate(initiativesListSel?.[0]?.endDate.toISOString().split('T')[0]);
    }
    if (initiativesListSel?.[0]?.initiativeId) {
      setInitiativeId(initiativesListSel?.[0]?.initiativeId);
    }
  }, [initiativesListSel]);

  const endOfNextBatchMonth = batchMonth
    ? getEndOfNextMonth(batchMonth)
    : undefined;

  const isNextMonthDisabled =
    !endOfNextBatchMonth || !nextMonthInitiativeEndDate
      ? true
      : endOfNextBatchMonth > nextMonthInitiativeEndDate;

  const handlePostponeTransaction = async () => {
    if (!initiativeEndDate) {return;}

    setLoading(true);
    try {
      await postponeTransaction(
        initiativeId,
        batchId ?? '',
        itemValues.id,
        initiativeEndDate
      );
      setAlert({
        title: 'Successo',
        text: 'Transazione spostata al mese successivo',
        isOpen: true,
        severity: 'success',
      });
      setInvoiceTransactionModal(false);
      onCloseDrawer?.();
      onSuccess?.();
    } catch (error) {
      setAlert({
        title: 'Errore',
        text: 'Non è stato possibile spostare la transazione',
        isOpen: true,
        severity: 'error',
      });
      setInvoiceTransactionModal(false);
      onCloseDrawer?.();
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadFile = async (selectedTransaction: any) => {
    setLoading(true);
    try {
      const response = await downloadInvoiceFile(
        selectedTransaction?.id,
        selectedTransaction?.pointOfSaleId
      );
      const invoiceUrl = response.invoiceUrl;

      const res = await fetch(invoiceUrl, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('Errore nel recupero del file');
      }

      const ext = selectedTransaction?.invoiceData?.filename?.split('.').pop()?.toLowerCase() || '';

      let mimeFromExt = '';
      if (ext === 'pdf') {
        mimeFromExt = 'application/pdf';
      } else if (ext === 'xml') {
        mimeFromExt = 'application/xml';
      } else {
        throw new Error('Errore nel recupero del file');
      }

      const blob = await res.blob();
      const file = new Blob([blob], { type: mimeFromExt });

      const url = URL.createObjectURL(file);

      const pdfWindow = window.open(url, '_blank');
      if (pdfWindow) {
        setTimeout(() => {
          // eslint-disable-next-line functional/immutable-data
          pdfWindow.document.title = selectedTransaction?.invoiceData?.filename;
        }, 100);
      }

      setLoading(false);
    } catch (error) {
      setAlert({
        title: 'Errore download file',
        text: 'Non è stato possibile scaricare il file',
        isOpen: true,
        severity: 'error',
        containerStyle: {
          height: 'fit-content',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '1300'
        },
        contentStyle: { position: 'unset', bottom: '0', right: '0' },
      });
      setLoading(false);
    }
  };

  function getValueText(driver: string, type: TYPE_TEXT) {
    const index = Object.keys(itemValues).indexOf(driver);
    const val = Object.values(itemValues)[index] as string;
    if (driver === 'additionalProperties.productName') {
      return itemValues?.additionalProperties?.productName ?? MISSING_DATA_PLACEHOLDER;
    }
    if (type === TYPE_TEXT.Text) {
      return formatValues(val);
    } else if (type === TYPE_TEXT.Currency) {
      return currencyFormatter(Number(val) / 100).toString();
    } else {
      return 'error on type';
    }
  }

  function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  return (
    <Box sx={{ width: 375 }} p={'1.5rem'} pt={0} data-testid="product-detail">
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h6">{title}</Typography>
        </Grid>
        {listItem.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Box mt={1}>
              <Typography
                variant="body2"
                fontWeight={theme.typography.fontWeightRegular}
                color={theme.palette.text.secondary}
              >
                {item?.label}
              </Typography>
              <Typography variant="body2" fontWeight="fontWeightMedium">
                {item.format
                  ? item.format(getNestedValue(itemValues, item?.id))
                  : getValueText(item?.id, item?.type)}
              </Typography>
            </Box>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box mt={1}>
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightRegular}
              color={theme.palette.text.secondary}
            >
              {itemValues.status === 'REFUNDED' ? 'Numero nota di credito' : 'Numero fattura'}
            </Typography>
            <Typography variant="body2" fontWeight={theme.typography.fontWeightMedium}>
              {itemValues?.invoiceData?.docNumber ?? MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mt={1}>
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightRegular}
              color={theme.palette.text.secondary}
            >
              {itemValues.status === 'REFUNDED' ? 'Nota di credito' : 'Fattura'}
            </Typography>
            <Button
              data-testid="btn-test"
              sx={{
                padding: '0',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#0055AA',
                },
              }}
              onClick={() => handleDownloadFile(itemValues)}
            >
              {isLoading ? (
                <CircularProgress color="inherit" size={20} data-testid="item-loader" />
              ) : (
                <>
                  <ReceiptLong /> {itemValues?.invoiceData?.filename ?? MISSING_DATA_PLACEHOLDER}
                </>
              )}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box mt={1}>
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightRegular}
              color={theme.palette.text.secondary}
            >
              Stato
            </Typography>
            <StatusChipInvoice status={itemValues?.rewardBatchTrxStatus} />
          </Box>
        </Grid>
        {[RewardBatchTrxStatusEnum.SUSPENDED, RewardBatchTrxStatusEnum.REJECTED].includes(
          itemValues.rewardBatchTrxStatus
        ) && (
          <Grid item xs={12}>
            <Box mt={1}>
              <Typography
                variant="overline"
                fontWeight={theme.typography.fontWeightBold}
                color={theme.palette.text.primary}
              >
                nota ufficiale
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {itemValues?.rewardBatchRejectionReason ?? MISSING_DATA_PLACEHOLDER}
              </Typography>
            </Box>
          </Grid>
        )}
        { statusBatch === 'CREATED' && (
          <Grid item xs={12}>
            <Box
              mt={1}
              sx={{
                bottom: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
              }}
            >
              <Button
                data-testid='next-month-btn'
                onClick={() => setInvoiceTransactionModal(true)}
                disabled={isNextMonthDisabled}
                variant={'contained'}>
                {'Sposta al mese successivo'}
              </Button>
            </Box>
          </Grid>
        )}
        <ModalComponent data-testid="modal-component" open={invoiceTransactionModal} onClose={() => setInvoiceTransactionModal(false)}>
          <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Typography variant="h6">{t('pages.refundRequests.invoiceDetailConfirmModal.title')}</Typography>
            <Typography variant="body1">{t('pages.refundRequests.invoiceDetailConfirmModal.description')}</Typography>
          </Box>
          <Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={4}>
            <Button variant="outlined" onClick={() => {
              setInvoiceTransactionModal(false);
            }}>
              Indietro
            </Button>
            <Button
              onClick={handlePostponeTransaction}
              variant="contained">
              {'Conferma'}
            </Button>
          </Box>
        </ModalComponent>
      </Grid>
    </Box>

  );
}
