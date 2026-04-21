import { useCallback, useEffect, useState, useRef } from 'react';
import {
  Box,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  IconButton,
  RadioGroup,
  Radio,
} from '@mui/material';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { Trans, useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { GridColDef } from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia/theme';
import { useHistory } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import DataTable from '../../components/dataTable/DataTable';
import CustomChip from '../../components/Chip/CustomChip';
import { getRewardBatches, sendRewardBatch } from '../../services/merchantService';
import { getBatchStatus } from '../../components/Transactions/useStatus';
import CurrencyColumn from '../../components/Transactions/CurrencyColumn';
import NoResultPaper from '../reportedUsers/NoResultPaper';
import { useAlert } from '../../hooks/useAlert';
import { BASE_ROUTE } from '../../routes';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { RewardBatchDTO } from '../../api/generated/merchants/data-contracts';
import { RefundRequestsModal } from './RefundRequestModal';

const posTypeMapper: Record<string, string> = {
  PHYSICAL: 'Fisico',
  ONLINE: 'Online',
};

const RefundRequests = () => {
  const { setAlert } = useAlert();
  const { initiativeId } = useCurrentInitiativeId();
  const history = useHistory();
  const { t } = useTranslation();

  const requestIdRef = useRef<number>(0);

  const [disabledRows, setDisabledRows] = useState<Array<string>>([]);
  const [selectedRow, setSelectedRow] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [rewardBatches, setRewardBatches] = useState<Array<RewardBatchDTO>>([]);
  const [rewardBatchesLoading, setRewardBatchesLoading] = useState<boolean>(false);
  const [sendBatchIsLoading, setSendBatchIsLoading] = useState<boolean>(false);

  const [modal, setModal] = useState<Record<string, any>>({
    isOpen: false,
    title: '',
    description: '',
    cancelBtn: { text: '', variant: 'outlined' },
    confirmBtn: false,
    setIsOpen: () => {},
  });

  const [currentPagination, setCurrentPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
  });

  // ✅ Reset deterministico su cambio iniziativa (multi-iniziativa safe)
  useEffect(() => {
    if (!initiativeId) {
      return;
    }
    setSelectedRow('');
    setSelectedRadio('');
    setDisabledRows([]);
    setCurrentPagination({
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
    });
  }, [initiativeId]);

  const fetchRewardBatches = async (
    initiativeIdParam: string,
    pageNo: number,
    pageSize: number
  ): Promise<void> => {
    const currentRequestId = requestIdRef.current + 1;
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = currentRequestId;

    setRewardBatchesLoading(true);

    try {
      const response = await getRewardBatches(initiativeIdParam, pageNo, pageSize);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (response?.content) {
        const mappedResponse = response.content.map((value) => ({
          ...value,
          approvedAmountCents: value.status === 'APPROVED' ? value.approvedAmountCents : undefined,
          suspendedAmountCents:
            value.status === 'APPROVED' ? value.suspendedAmountCents : undefined,
        }));

        setRewardBatches(mappedResponse);

        if (
          response?.pageNo !== pageNo ||
          response?.pageSize !== pageSize ||
          response?.totalElements !== currentPagination.totalElements
        ) {
          setCurrentPagination({
            pageNo: response?.pageNo as number,
            pageSize: response?.pageSize as number,
            totalElements: response?.totalElements as number,
          });
        }

        setSelectedRow('');
      }
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setRewardBatchesLoading(false);
      }
    }
  };

  // ✅ Effetto deterministico unico di fetch
  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    void fetchRewardBatches(initiativeId, currentPagination.pageNo, currentPagination.pageSize);
  }, [initiativeId, currentPagination.pageNo, currentPagination.pageSize]);

  const infoStyles = {
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.fontSize,
  };

  const renderCellWithTooltip = useCallback(
    (value: string) => (
      <Tooltip title={value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}>
        <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
          {value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}
        </Typography>
      </Tooltip>
    ),
    []
  );

  const isRowSelectable = (params: any) => {
    if (params?.row?.status !== 'CREATED' || disabledRows.includes(params?.row?.id)) {
      return false;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const batchMonth = Number(params?.row?.month?.split('-')[1]);
    const batchYear = Number(params?.row?.month?.split('-')[0]);

    if (batchYear < currentYear) {
      return true;
    }

    return batchYear === currentYear && batchMonth < currentMonth;
  };

  const handleRadioButtonChange = useCallback(
    (rowId: string) => {
      const invalidRow = rewardBatches.find(
        (row) => rowId === row.id ? !row?.numberOfTransactions : undefined
      );

      if (invalidRow) {
      setTimeout(() => {
        handleRadioButtonChange('');
      }, 300);
        setModal({
          title: t('pages.refundRequests.emptyBatchModal.title'),
          description: (
            <Trans
              i18nKey="pages.refundRequests.emptyBatchModal.description"
              values={{ name: invalidRow.name }}
              components={{ b: <b /> }}
            />
          ),
          isOpen: true,
          confirmBtn: false,
          cancelBtn: { text: 'Chiudi', variant: 'contained' },
          setIsOpen: () => {
            setDisabledRows((prev) => (invalidRow.id ? [...prev, invalidRow.id] : prev));
            setModal((prev) => ({ ...prev, isOpen: false }));
          },
        });
      }
    const selectedRowObjects = rewardBatches.find(({ id }) => id === rowId);
    setSelectedRow((!invalidRow && selectedRowObjects?.id) || '');
    setSelectedRadio(selectedRowObjects?.id ?? '');
    },
    [rewardBatches, t]
  );

  const StatusChip = ({ status }: any) => {
    const chipItem = getBatchStatus(status);
    return (
      <CustomChip
        label={chipItem?.label}
        colorChip={chipItem?.color}
        sizeChip="small"
        textColorChip={chipItem?.textColor}
      />
    );
  };

  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: '',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      flex: 0.5,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Radio
            disabled={!isRowSelectable(params)}
            onClick={() =>
              handleRadioButtonChange(params.value === selectedRow ? '' : params.value)
            }
            value={params.value}
          />
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'Lotto',
      flex: 2,
      sortable: false,
      renderCell: (params: any) => renderCellWithTooltip(params.value),
    },
    {
      field: 'posType',
      headerName: 'Tipologia',
      flex: 2,
      sortable: false,
      renderCell: (params: any) => renderCellWithTooltip(posTypeMapper[params.value]),
    },
    {
      field: 'initialAmountCents',
      headerName: 'Rimborso richiesto',
      flex: 2,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value / 100} />,
    },
    {
      field: 'approvedAmountCents',
      headerName: 'Rimborso approvato',
      flex: 2,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value / 100} isValueVisible />,
    },
    {
      field: 'suspendedAmountCents',
      headerName: 'Rimborso sospeso',
      flex: 2,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value / 100} isValueVisible />,
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 2,
      sortable: false,
      renderCell: (params: any) => <StatusChip status={params.value} />,
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.3,
      sortable: false,
      renderCell: (params: any) => (
        <IconButton
          onClick={() =>
            history.push(`${BASE_ROUTE}/${initiativeId}/richieste-di-rimborso/${params.row?.id}`, {
              store: params.row,
            })
          }
          size="small"
        >
          <ChevronRightIcon color="primary" fontSize="inherit" />
        </IconButton>
      ),
    },
  ];

  const handlePaginationPageChange = useCallback((page: number) => {
    setCurrentPagination((prev) => ({ ...prev, pageNo: page }));
  }, []);

  const handleSentBatches = async () => {
    setSendBatchIsLoading(true);
    try {
      if (!initiativeId || !selectedRow) {
        console.error('Missing initiativeId or batchId');
        return;
      }

      const result = (await sendRewardBatch(initiativeId, selectedRow)) as any;

      if ('code' in result && result?.code === 'REWARD_BATCH_PREVIOUS_NOT_SENT') {
        setAlert({
          title: t('errors.genericTitle'),
          text: t('errors.sendTheBatchForPreviousMonth'),
          isOpen: true,
          severity: 'error',
        });
        return;
      }

      setAlert({
        text: t('pages.refundRequests.rewardBatchSentSuccess'),
        isOpen: true,
        severity: 'success',
      });

      await fetchRewardBatches(initiativeId, currentPagination.pageNo, currentPagination.pageSize);
    } catch {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    } finally {
      handleRadioButtonChange('');
      setSendBatchIsLoading(false);
      setModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <Box p={1.5}>
      <RefundRequestsModal
        isOpen={modal.isOpen}
        setIsOpen={modal.setIsOpen}
        title={modal.title}
        description={modal.description}
        cancelBtn={modal.cancelBtn}
        confirmBtn={
          modal.confirmBtn
            ? { text: 'Invia', onConfirm: handleSentBatches, loading: sendBatchIsLoading }
            : undefined
        }
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TitleBox
          title={t('pages.refundRequests.title')}
          subTitle={t('pages.refundRequests.subtitle')}
          variantTitle="h4"
          variantSubTitle="body1"
        />

        {selectedRow && (
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              setModal({
                isOpen: true,
                title: t('pages.refundRequests.ModalRefundRequests.title'),
                description: t('pages.refundRequests.ModalRefundRequests.description'),
                cancelBtn: { text: 'Indietro', variant: 'outlined' },
                confirmBtn: true,
                setIsOpen: () => setModal((prev) => ({ ...prev, isOpen: false })),
              })
            }
            startIcon={<SendIcon />}
          >
            {t('pages.refundRequests.sendRequests')}
          </Button>
        )}
      </Stack>

      <Box mt={2}>
        {rewardBatchesLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        )}

        {!rewardBatchesLoading && rewardBatches.length > 0 && (
          <RadioGroup value={selectedRadio}>
            <DataTable
              columns={columns}
              rows={rewardBatches}
              rowsPerPage={currentPagination.pageSize}
              paginationModel={currentPagination}
              onPaginationPageChange={handlePaginationPageChange}
            />
          </RadioGroup>
        )}

        {!rewardBatchesLoading && rewardBatches.length === 0 && (
          <NoResultPaper translationKey="pages.refundRequests.noData" />
        )}
      </Box>
    </Box>
  );
};

export default RefundRequests;
