import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Box, Stack, Tooltip, Typography, CircularProgress, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';
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
import { RewardBatchDTO } from '../../api/generated/merchants/RewardBatchDTO';
import NoResultPaper from '../reportedUsers/NoResultPaper';
import { useAlert } from '../../hooks/useAlert';
import { BASE_ROUTE } from '../../routes';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { RefundRequestsModal } from './RefundRequestModal';

const posTypeMapper: Record<string, string> = {
  PHYSICAL: 'Fisico',
  ONLINE: 'Online',
};

const RefundRequests = () => {
  const { setAlert } = useAlert();
  const { initiativeId } = useCurrentInitiativeId();
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Array<RewardBatchDTO>>([]);
  const [rewardBatches, setRewardBatches] = useState<Array<RewardBatchDTO>>([]);
  const [rewardBatchesLoading, setRewardBatchesLoading] = useState<boolean>(false);
  const [sendBatchIsLoading, setSendBatchIsLoading] = useState<boolean>(false);
  const [currentPagination, setCurrentPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
  });
  const requestIdRef = useRef<number>(0);
  const columns: Array<GridColDef> = useMemo(
    () => [
      {
        field: 'spacer',
        headerName: '',
        flex: 1,
        sortable: false,
        disableColumnMenu: true,
        renderCell: () => '',
      },
      {
        field: 'name',
        headerName: 'Lotto',
        disableColumnMenu: true,
        flex: 2,
        sortable: false,
        renderCell: (params: any) => renderCellWithTooltip(params.value),
      },
      {
        field: 'posType',
        headerName: 'Tipologia',
        disableColumnMenu: true,
        flex: 2,
        sortable: false,
        renderCell: (params: any) => renderCellWithTooltip(posTypeMapper[params.value]),
      },
      {
        field: 'initialAmountCents',
        headerName: 'Rimborso richiesto',
        disableColumnMenu: true,
        flex: 2,
        sortable: false,
        renderCell: (params: any) => <CurrencyColumn value={params.value / 100} />,
      },
      {
        field: 'approvedAmountCents',
        headerName: 'Rimborso approvato',
        disableColumnMenu: true,
        flex: 2,
        sortable: false,
        renderCell: (params: any) => <CurrencyColumn value={params.value / 100} isValueVisible />,
      },
      {
        field: 'suspendedAmountCents',
        headerName: 'Rimborso sospeso',
        disableColumnMenu: true,
        flex: 2,
        sortable: false,
        renderCell: (params: any) => <CurrencyColumn value={params.value / 100} isValueVisible />,
      },
      {
        field: 'status',
        headerName: 'Stato',
        disableColumnMenu: true,
        flex: 2,
        sortable: false,
        renderCell: (params: any) => <StatusChip status={params.value} />,
      },
      {
        field: 'actions',
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        flex: 0.3,
        renderCell: (params: any) => (
          <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
            <IconButton
              onClick={() => {
                if (!initiativeId) {
                  return;
                }
                history.push(
                  `${BASE_ROUTE}/${initiativeId}/richieste-di-rimborso/${params.row?.id}`,
                  { store: params.row }
                );
              }}
              size="small"
            >
              <ChevronRightIcon data-testid={params.row.id} color="primary" fontSize="inherit" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [initiativeId]
  );
  const { t } = useTranslation();

  // STEP 1 – Reset deterministico su cambio iniziativa
  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    setSelectedRows([]);
    setIsModalOpen(false);
    setCurrentPagination({
      pageNo: 0,
      pageSize: 10,
      totalElements: 0,
    });
  }, [initiativeId]);

  const infoStyles = {
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.fontSize,
  };

  const fetchRewardBatches = async (
    initiativeId: string,
    pageNo: number,
    pageSize: number
  ): Promise<void> => {
    const currentRequestId = requestIdRef.current + 1;
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = currentRequestId;

    setRewardBatchesLoading(true);

    try {
      const response = await getRewardBatches(initiativeId, pageNo, pageSize);

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
        setSelectedRows([]);
      }
    } catch (error: any) {
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

  const handlePaginationPageChange = useCallback((page: number) => {
    setCurrentPagination((prev) => ({ ...prev, pageNo: page }));
  }, []);

  const handleRowSelectionChange = useCallback((rows: Array<number>) => {
    setSelectedRows(rows);
  }, []);

  // STEP 3 – Effetto deterministico unico di fetch
  useEffect(() => {
    if (!initiativeId) {
      return;
    }

    void fetchRewardBatches(initiativeId, currentPagination.pageNo, currentPagination.pageSize);
  }, [initiativeId, currentPagination.pageNo, currentPagination.pageSize]);

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

  const isRowSelectable = (params: any) => {
    if (params?.row?.status !== 'CREATED' || params?.row?.numberOfTransactions === 0) {
      return false;
    }

    const yearMonth = new Date().toISOString().slice(0, 7);
    const currentMonth = Number(yearMonth.split('-')[1]);
    const currentYear = Number(yearMonth.split('-')[0]);
    const batchMonth = Number(params?.row?.month?.split('-')[1]);
    const batchYear = Number(params?.row?.month?.split('-')[0]);

    if (batchYear < currentYear) {
      return true;
    }

    return !!(batchYear === currentYear && batchMonth < currentMonth);
  };

  const handleSentBatches = async () => {
    setSendBatchIsLoading(true);
    try {
      const batchId = selectedRows && selectedRows?.length > 0 ? selectedRows[0]?.id : '';
      if (!batchId) {
        console.error('Missing initiativeId or batchId');
        return;
      }
      if (!initiativeId) {
        return;
      }
      const result = (await sendRewardBatch(initiativeId, batchId.toString())) as any;
      if ('code' in result && result?.code === 'REWARD_BATCH_PREVIOUS_NOT_SENT') {
        setAlert({
          title: t('errors.genericTitle'),
          text: t('errors.sendTheBatchForPreviousMonth'),
          isOpen: true,
          severity: 'error',
        });
        return;
      }
      setTimeout(() => {
        setAlert({
          text: t('pages.refundRequests.rewardBatchSentSuccess'),
          isOpen: true,
          severity: 'success',
        });
      }, 1000);
      if (initiativeId) {
        await fetchRewardBatches(
          initiativeId,
          currentPagination.pageNo,
          currentPagination.pageSize
        );
      }
    } catch (e: any) {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
      if (initiativeId) {
        await fetchRewardBatches(
          initiativeId,
          currentPagination.pageNo,
          currentPagination.pageSize
        );
      }
    } finally {
      setSendBatchIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <Box p={1.5}>
      <RefundRequestsModal
        isOpen={isModalOpen}
        setIsOpen={() => setIsModalOpen(false)}
        title={t('pages.refundRequests.ModalRefundRequests.title')}
        description={t('pages.refundRequests.ModalRefundRequests.description')}
        cancelBtn="Indietro"
        confirmBtn={{ text: `Invia`, onConfirm: handleSentBatches, loading: sendBatchIsLoading }}
      />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <TitleBox
          title={t('pages.refundRequests.title')}
          subTitle={t('pages.refundRequests.subtitle')}
          mbTitle={2}
          variantTitle="h4"
          variantSubTitle="body1"
        />
        {selectedRows.length > 0 && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setIsModalOpen(true)}
            startIcon={<SendIcon />}
            sx={{
              width: {
                xs: '100%',
                md: 'auto',
                alignSelf: 'start',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
              },
            }}
          >
            {t('pages.refundRequests.sendRequests')}
          </Button>
        )}
      </Stack>

      <Box>
        {rewardBatchesLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        )}

        {!rewardBatchesLoading && rewardBatches && rewardBatches.length > 0 && (
          <DataTable
            columns={columns}
            rows={rewardBatches}
            rowsPerPage={currentPagination.pageSize}
            checkable={true}
            paginationModel={{
              pageNo: currentPagination.pageNo,
              pageSize: currentPagination.pageSize,
              totalElements: currentPagination.totalElements,
            }}
            onPaginationPageChange={handlePaginationPageChange}
            onRowSelectionChange={handleRowSelectionChange}
            isRowSelectable={isRowSelectable}
            singleSelect
          />
        )}
        {!rewardBatchesLoading && (!rewardBatches || rewardBatches.length === 0) && (
          <NoResultPaper translationKey="pages.refundRequests.noData" />
        )}
      </Box>
    </Box>
  );
};

export default RefundRequests;
