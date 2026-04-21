import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { ReceiptLong } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import routes from '../../../routes';
import { postponeTransaction } from '../../../services/merchantService';
import { getMerchantsApi } from '../../../api/MerchantsApiClient';
import { TYPE_TEXT, MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { formatValues, currencyFormatter, getEndOfNextMonth } from '../../../utils/formatUtils';
import StatusChipInvoice from '../../../components/Chip/StatusChipInvoice';
import { RewardBatchTrxStatus } from '../../../api/generated/merchants/data-contracts';
import { useAlert } from '../../../hooks/useAlert';
import ModalComponent from '../../../components/modal/ModalComponent';
import { formatDate, isReversableOrEditable } from '../../../helpers';
import { ReasonDTO } from '../../../api/generated/merchants/data-contracts';
import DetailDrawer, { DetailDrawerProps } from '../../../components/Drawer/DetailDrawer';
import { RewardBatchDTO } from '../../../api/generated/merchants/data-contracts';

type StatusEnum = RewardBatchDTO['status'];
const CREATED_STATUS: StatusEnum = 'CREATED';
import { useCurrentInitiative } from '../../../hooks/useCurrentInitiative';

type Props = DetailDrawerProps & {
  itemValues: Record<string, any>;
  listItem: Array<any>;
  onSuccess?: () => void;
  onCloseDrawer?: () => void;
};

export default function InvoiceDetail({
  itemValues,
  listItem,
  onSuccess,
  onCloseDrawer,
  isOpen,
  setIsOpen,
  ...rest
}: Props) {
  const { setAlert } = useAlert();
  const [isLoading, setLoading] = useState(false);
  const [initiativeEndDate, setInitiativeEndDate] = useState<string>('');
  const [nextMonthInitiativeEndDate, setNextMonthInitiativeEndDate] = useState<Date | undefined>();
  const [invoiceTransactionModal, setInvoiceTransactionModal] = useState(false);
  const location = useLocation<{ store: RewardBatchDTO }>();
  const batchMonth = location.state?.store?.month;
  const statusBatch = location.state?.store?.status;
  const { t } = useTranslation();
  const currentInitiative = useCurrentInitiative();
  const history = useHistory();
  const { initiative_id } = useParams<{ initiative_id: string; batch_id: string }>();

  useEffect(() => {
    if (currentInitiative?.endDate) {
      const endDateObj = new Date(currentInitiative.endDate);
      const endOfNextMonth = getEndOfNextMonth(endDateObj);
      setNextMonthInitiativeEndDate(endOfNextMonth);
      setInitiativeEndDate(endDateObj.toISOString().split('T')[0]);
    }
  }, [currentInitiative]);

  const endOfNextBatchMonth = batchMonth ? getEndOfNextMonth(batchMonth) : undefined;

  const isNextMonthDisabled =
    !endOfNextBatchMonth || !nextMonthInitiativeEndDate
      ? true
      : endOfNextBatchMonth > nextMonthInitiativeEndDate;

  const isPostponeBtnVisible =
    statusBatch === CREATED_STATUS &&
    itemValues?.rewardBatchTrxStatus !== RewardBatchTrxStatus.APPROVED &&
    itemValues?.rewardBatchTrxStatus !== RewardBatchTrxStatus.REJECTED;

  const postponeButton: DetailDrawerProps['buttons'] = useMemo(
    () =>
      isPostponeBtnVisible
        ? [
            {
              disabled: isNextMonthDisabled,
              onClick: () => setInvoiceTransactionModal(true),
              variant: 'contained',
              title: 'Sposta al mese successivo',
              dataTestId: 'next-month-btn',
            },
          ]
        : [],
    [isNextMonthDisabled, isPostponeBtnVisible]
  );
  const editButton: DetailDrawerProps['buttons'] = useMemo(
    () =>
      isReversableOrEditable(itemValues, statusBatch)
        ? [
            {
              variant: 'contained',
              title: 'Modifica documento',
              dataTestId: 'change-file-btn',
              onClick: () => {
                const path = routes.MODIFY_DOCUMENT.replace(':initiative_id', initiative_id)
                  .replace(':pointOfSaleId', itemValues?.pointOfSaleId)
                  .replace(':trxId', itemValues.id)
                  .replace(':fileDocNumber', window.btoa(itemValues?.invoiceData?.docNumber ?? ''));

                history.push(path, { fromPath: history.location.pathname });
              },
            },
          ]
        : [],
    [isReversableOrEditable, itemValues?.id, itemValues?.invoiceFile?.docNumber, history]
  );

  const reverseButton: DetailDrawerProps['buttons'] = useMemo(
    () =>
      isReversableOrEditable(itemValues, statusBatch)
        ? [
            {
              title: 'Storna',
              dataTestId: 'reverse-btn',
              onClick: () => {
                const path = routes.REVERSE.replace(':initiative_id', initiative_id)
                  .replace(':pointOfSaleId', itemValues?.pointOfSaleId)
                  .replace(':trxId', itemValues.id);
                history.push(path, { fromLocation: history.location });
              },
            },
          ]
        : [],
    [isReversableOrEditable, itemValues?.id, itemValues?.invoiceFile?.docNumber, history]
  );

  const handlePostponeTransaction = async () => {
    if (!initiativeEndDate) {
      return;
    }

    setLoading(true);
    try {
      const rewardBatchId = location.state?.store?.id;
      if (!rewardBatchId) {
        throw new Error('Missing rewardBatchId');
      }

      await postponeTransaction(initiative_id, rewardBatchId, itemValues?.id, initiativeEndDate);
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
      const response = await getMerchantsApi().downloadInvoiceFile(
        selectedTransaction?.pointOfSaleId,
        selectedTransaction?.trxId
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
          zIndex: '1300',
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
    <>
      <DetailDrawer
        {...rest}
        data-testid="transaction-detail"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        buttons={[...editButton, ...postponeButton, ...reverseButton]}
      >
        {listItem.map((item, index) => (
          <Box key={`${item?.id}-${index}`}>
            <Typography
              variant="body2"
              fontWeight={theme.typography.fontWeightRegular}
              color={theme.palette.text.secondary}
            >
              {item?.label}
            </Typography>
            <Typography
              variant="body2"
              fontWeight="fontWeightMedium"
              sx={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {item.format
                ? item.format(getNestedValue(itemValues, item?.id))
                : getValueText(item?.id, item?.type)}
            </Typography>
          </Box>
        ))}
        <Box>
          <Typography
            variant="body2"
            fontWeight={theme.typography.fontWeightRegular}
            color={theme.palette.text.secondary}
          >
            {itemValues.status === 'REFUNDED' ? 'Numero nota di credito' : 'Numero fattura'}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={theme.typography.fontWeightMedium}
            sx={{ overflowWrap: 'break-word' }}
          >
            {itemValues?.invoiceData?.docNumber ?? MISSING_DATA_PLACEHOLDER}
          </Typography>
        </Box>
        <Box>
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
              padding: 0,
              width: '100%',
              display: 'block',
              textAlign: 'left',
              minWidth: 0,
              maxWidth: '100%',
              minHeight: 'fit-content',
              height: 'auto',
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  width: '100%',
                  mt: '2px',
                  minWidth: 0,
                }}
              >
                <ReceiptLong sx={{ flexShrink: 0, mt: '2px' }} />
                <Typography
                  component="span"
                  variant="inherit"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  {itemValues?.invoiceData?.filename ?? MISSING_DATA_PLACEHOLDER}
                </Typography>
              </Box>
            )}
          </Button>
        </Box>
        <Box>
          <Typography
            variant="body2"
            fontWeight={theme.typography.fontWeightRegular}
            color={theme.palette.text.secondary}
          >
            Stato
          </Typography>
          <StatusChipInvoice status={itemValues?.rewardBatchTrxStatus} />
        </Box>
        {[RewardBatchTrxStatus.SUSPENDED, RewardBatchTrxStatus.REJECTED].includes(
          itemValues.rewardBatchTrxStatus
        ) && (
          <Box>
            <Typography
              variant="overline"
              fontWeight={theme.typography.fontWeightBold}
              color={theme.palette.text.primary}
            >
              Nota ufficiale
            </Typography>
            <Typography
              variant="body2"
              component="div"
              fontWeight={600}
              sx={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {itemValues?.rewardBatchRejectionReason &&
              itemValues?.rewardBatchRejectionReason.length ? (
                itemValues?.rewardBatchRejectionReason.map(
                  ({ date, reason }: ReasonDTO, index: number) => (
                    <Box key={`${date}-${index}`}>
                      <Typography
                        variant="body2"
                        fontWeight={theme.typography.fontWeightRegular}
                        color={theme.palette.text.secondary}
                      >
                        {date ? formatDate(new Date(date)) : MISSING_DATA_PLACEHOLDER}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={theme.typography.fontWeightMedium}
                        sx={{ overflowWrap: 'break-word' }}
                      >
                        {reason ?? MISSING_DATA_PLACEHOLDER}
                      </Typography>
                    </Box>
                  )
                )
              ) : (
                <Typography
                  variant="body2"
                  fontWeight={theme.typography.fontWeightMedium}
                  sx={{ overflowWrap: 'break-word' }}
                >
                  {MISSING_DATA_PLACEHOLDER}
                </Typography>
              )}
            </Typography>
          </Box>
        )}
      </DetailDrawer>
      <ModalComponent
        data-testid="modal-component"
        open={invoiceTransactionModal}
        onClose={() => setInvoiceTransactionModal(false)}
      >
        <Box display={'flex'} flexDirection={'column'} gap={2}>
          <Typography variant="h6">
            {t('pages.refundRequests.invoiceDetailConfirmModal.title')}
          </Typography>
          <Typography variant="body1">
            {t('pages.refundRequests.invoiceDetailConfirmModal.description')}
          </Typography>
        </Box>
        <Box display={'flex'} justifyContent={'flex-end'} gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={() => {
              setInvoiceTransactionModal(false);
            }}
          >
            Indietro
          </Button>
          <Button onClick={handlePostponeTransaction} variant="contained">
            {'Conferma'}
          </Button>
        </Box>
      </ModalComponent>
    </>
  );
}
