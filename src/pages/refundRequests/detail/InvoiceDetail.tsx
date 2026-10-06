import { Box, Typography, Tooltip, Button } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import useScopedTranslation from '../../../hooks/useScopedTranslation';
import routes from '../../../routes';
import { postponeTransaction } from '../../../services/merchantService';
import { getMerchantsApi } from '../../../api/MerchantsApiClient';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import { getEndOfNextMonth } from '../../../utils/formatUtils';
import StatusChipInvoice from '../../../components/Chip/StatusChipInvoice';
import { RewardBatchTrxStatus } from '../../../api/generated/merchants/data-contracts';
import { useAlert } from '../../../hooks/useAlert';
import { useUserPermissions, PERMISSION_KEYS } from '../../../hooks/useUserPermissions';
import ModalComponent from '../../../components/modal/ModalComponent';
import { formatDate, isReversableOrEditable } from '../../../helpers';
import { ReasonDTO } from '../../../api/generated/merchants/data-contracts';
import DetailDrawer, { DetailDrawerProps } from '../../../components/Drawer/DetailDrawer';
import {
  DrawerFileButton,
  DrawerLabeledValue,
  drawerTruncatedTextSx,
  getDetailValueText,
  getDrawerTooltipTitle,
} from '../../../components/Drawer/detailDrawerShared';
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
  const { t } = useScopedTranslation();
  const currentInitiative = useCurrentInitiative();
  const history = useHistory();
  const { initiative_id } = useParams<{ initiative_id: string; batch_id: string }>();
  const { isActionDisabled } = useUserPermissions();
  const isModifyDocDisabled = isActionDisabled(PERMISSION_KEYS.TRANSACTION_MODIFY_DOC);
  const isReverseDisabled = isActionDisabled(PERMISSION_KEYS.TRANSACTION_REVERSE);
  const isPostponeDisabled = isActionDisabled(PERMISSION_KEYS.TRANSACTION_POSTPONE);

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
              disabled: isNextMonthDisabled || isPostponeDisabled,
              onClick: () => setInvoiceTransactionModal(true),
              variant: 'contained',
              title: 'Sposta al mese successivo',
              dataTestId: 'next-month-btn',
            },
          ]
        : [],
    [isNextMonthDisabled, isPostponeBtnVisible, isPostponeDisabled]
  );
  const editButton: DetailDrawerProps['buttons'] = useMemo(
    () =>
      isReversableOrEditable(itemValues, statusBatch)
        ? [
            {
              variant: 'contained',
              title: 'Modifica documento',
              dataTestId: 'change-file-btn',
              disabled: isModifyDocDisabled,
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
    [isReversableOrEditable, itemValues?.id, itemValues?.invoiceFile?.docNumber, history, isModifyDocDisabled]
  );

  const reverseButton: DetailDrawerProps['buttons'] = useMemo(
    () =>
      isReversableOrEditable(itemValues, statusBatch)
        ? [
            {
              title: 'Storna',
              dataTestId: 'reverse-btn',
              disabled: isReverseDisabled,
              onClick: () => {
                const path = routes.REVERSE.replace(':initiative_id', initiative_id)
                  .replace(':pointOfSaleId', itemValues?.pointOfSaleId)
                  .replace(':trxId', itemValues.id);
                history.push(path, { fromLocation: history.location });
              },
            },
          ]
        : [],
    [isReversableOrEditable, itemValues?.id, itemValues?.invoiceFile?.docNumber, history, isReverseDisabled]
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

      await postponeTransaction(initiative_id, rewardBatchId, itemValues?.id);
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
        initiative_id,
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
        {listItem.map((item, index) => {
          const displayValue = item.format
            ? item.format(getNestedValue(itemValues, item?.id))
            : getDetailValueText(itemValues, item?.id, item?.type);

          return (
            <DrawerLabeledValue key={`${item?.id}-${index}`} label={item?.label} value={displayValue} />
          );
        })}
        <DrawerLabeledValue
          label={itemValues.status === 'REFUNDED' ? 'Numero nota di credito' : 'Numero fattura'}
          value={itemValues?.invoiceData?.docNumber}
        />
        <DrawerFileButton
          label={itemValues.status === 'REFUNDED' ? 'Nota di credito' : 'Fattura'}
          filename={itemValues?.invoiceData?.filename}
          isLoading={isLoading}
          onClick={() => handleDownloadFile(itemValues)}
          iconSx={{ mt: '2px' }}
        />
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
                      <Tooltip title={getDrawerTooltipTitle(reason)}>
                        <Typography
                          variant="body2"
                          fontWeight={theme.typography.fontWeightMedium}
                          sx={drawerTruncatedTextSx}
                        >
                          {reason ?? MISSING_DATA_PLACEHOLDER}
                        </Typography>
                      </Tooltip>
                    </Box>
                  )
                )
              ) : (
                <Tooltip title={MISSING_DATA_PLACEHOLDER}>
                  <Typography
                    variant="body2"
                    fontWeight={theme.typography.fontWeightMedium}
                    sx={drawerTruncatedTextSx}
                  >
                    {MISSING_DATA_PLACEHOLDER}
                  </Typography>
                </Tooltip>
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
