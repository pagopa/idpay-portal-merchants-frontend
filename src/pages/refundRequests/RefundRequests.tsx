import { useCallback, useEffect, useState } from 'react';
import { Box, Stack, Tooltip, Typography, CircularProgress, IconButton, RadioGroup, Radio } from '@mui/material';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { Trans, useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { GridColDef } from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia/theme';
import { useHistory, useParams } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
import { browserConsole } from '../../utils/consoleLogger';
import { RefundRequestsModal } from './RefundRequestModal';

interface RouteParams {
  initiative_id: string;
}

const posTypeMapper: Record<string, string> = {
  PHYSICAL: 'Fisico',
  ONLINE: 'Online',
};

const RefundRequests = () => {
  const { setAlert } = useAlert();
  const { initiative_id } = useParams<RouteParams>();
  const history = useHistory();
  const [disabledRows, setDisabledRows] = useState<Array<string>>([]);
  const [modal, setModal] = useState<Record<string, any>>({
    isOpen: false,
    title: "",
    description: "",
    cancelBtn: { text: "", vaiant: "outlined" },
    confirmBtn: false,
    setIsOpen: () => { }
  });
  const [selectedRow, setSelectedRow] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<string>('');
  const [rewardBatches, setRewardBatches] = useState<Array<RewardBatchDTO>>([]);
  const [rewardBatchesLoading, setRewardBatchesLoading] = useState<boolean>(false);
  const [sendBatchIsLoading, setSendBatchIsLoading] = useState<boolean>(false);
  const [currentPagination, setCurrentPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
  });

  const isRowSelectable = (params: any) => {
    if (params?.row?.status !== 'CREATED' || disabledRows.includes(params?.row?.id)) {
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

    return (batchYear === currentYear && batchMonth < currentMonth);
  };

  const handleRadioButtonChange = useCallback((rowId: string) => {
    const invalidRow = rewardBatches.find((row: RewardBatchDTO) => rowId === row.id ? !row?.numberOfTransactions : undefined);
    if (invalidRow) {
      setTimeout(() => {
        handleRadioButtonChange('');
      }, 300);
      setModal({
        title: t('pages.refundRequests.emptyBatchModal.title'),
        description: <Trans
          i18nKey='pages.refundRequests.emptyBatchModal.description'
          values={{ name: invalidRow.name }}
          components={{ b: <b /> }}
        />,
        isOpen: true,
        confirmBtn: false,
        cancelBtn: { text: "Chiudi", variant: "contained" },
        setIsOpen: () => {
          setDisabledRows(prev => [...prev, invalidRow.id]);
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
    const selectedRowObjects = rewardBatches.find(({ id }) => id === rowId);
    setSelectedRow((!invalidRow && selectedRowObjects?.id) ?? '');
    setSelectedRadio(selectedRowObjects?.id ?? '');
  }, [rewardBatches]);
  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: '',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      flex: 0.5,
      renderCell: (params: any) => (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Radio
          disabled={!isRowSelectable(params)}
          onClick={() => handleRadioButtonChange(params.value === selectedRow ? '' : params.value)}
          value={params.value}
          data-testid={`radio-btn-${params.value}`}
        />
      </Box>),
    },
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
              history.push(
                `${BASE_ROUTE}/${initiative_id}/richieste-di-rimborso/${params.row?.id}`,
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
  ];
  const { t } = useTranslation();

  useEffect(() => {
    void fetchRewardBatches(initiative_id);
  }, [currentPagination.pageNo, currentPagination.pageSize]);

  const infoStyles = {
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.fontSize,
  };

  const fetchRewardBatches = async (initiativeId: string): Promise<void> => {
    setRewardBatchesLoading(true);
    try {
      const response = await getRewardBatches(
        initiativeId,
        currentPagination.pageNo,
        currentPagination.pageSize
      );
      if (response?.content) {
        const mappedResponse = response.content.map((value) => ({
          ...value,
          approvedAmountCents: value.status === 'APPROVED' ? value.approvedAmountCents : undefined,
          suspendedAmountCents:
            value.status === 'APPROVED' ? value.suspendedAmountCents : undefined,
        }));
        setRewardBatches(mappedResponse);
        setCurrentPagination({
          pageNo: response?.pageNo as number,
          pageSize: response?.pageSize as number,
          totalElements: response?.totalElements as number,
        });
        setSelectedRow('');
      }
    } catch (error: any) {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    } finally {
      setRewardBatchesLoading(false);
    }
  };

  const renderCellWithTooltip = (value: string) => (
    <Tooltip title={value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}>
      <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
        {value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}
      </Typography>
    </Tooltip>
  );

  const handlePaginationPageChange = (page: number) => {
    setCurrentPagination((prev) => ({ ...prev, pageNo: page }));
  };

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

  const handleSentBatches = async () => {
    setSendBatchIsLoading(true);
    try {
      const batchId = selectedRow ? selectedRow : '';
      if (!batchId) {
        browserConsole.error('Missing initiativeId or batchId');
        return;
      }
      const result = (await sendRewardBatch(initiative_id, batchId.toString())) as any;
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
      await fetchRewardBatches(initiative_id);
    } catch (e: any) {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
      await fetchRewardBatches(initiative_id);
    } finally {
      handleRadioButtonChange('');
      setSendBatchIsLoading(false);
      setModal(prev => ({ ...prev, isOpen: false }));
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
        confirmBtn={modal.confirmBtn ? { text: "Invia", onConfirm: handleSentBatches, loading: sendBatchIsLoading } : undefined}
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
        {selectedRow && (
          <Button
            variant="contained"
            size="small"
            onClick={() => setModal({
              isOpen: true,
              title: t('pages.refundRequests.ModalRefundRequests.title'),
              description: t('pages.refundRequests.ModalRefundRequests.description'),
              cancelBtn: { text: "Indietro", variant: "outlined" },
              confirmBtn: true,
              setIsOpen: () => setModal(prev => ({ ...prev, isOpen: false }))
            })}
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
          <RadioGroup value={selectedRadio}>
            <DataTable
              columns={columns}
              rows={rewardBatches}
              rowsPerPage={currentPagination.pageSize}
              paginationModel={{
                pageNo: currentPagination.pageNo,
                pageSize: currentPagination.pageSize,
                totalElements: currentPagination.totalElements,
              }}
              onPaginationPageChange={handlePaginationPageChange}
            />
          </RadioGroup>
        )}
        {!rewardBatchesLoading && (!rewardBatches || rewardBatches.length === 0) && (
          <NoResultPaper translationKey="pages.refundRequests.noData" />
        )}
      </Box>
    </Box>
  );
};

export default RefundRequests;
