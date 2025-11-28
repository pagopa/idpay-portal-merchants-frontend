import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { GridColDef } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import DataTable from '../../components/dataTable/DataTable';
// import CustomChip from '../../components/Chip/CustomChip';
import StatusChipInvoice from '../../components/Chip/StatusChipInvoice';
import DetailDrawer from '../../components/Drawer/DetailDrawer';
import { downloadInvoiceFile, getMerchantTransactionsProcessed } from '../../services/merchantService';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/MerchantTransactionsListDTO';
import { TYPE_TEXT } from '../../utils/constants';
import { safeFormatDate } from '../../utils/formatUtils';
// import { RewardBatchTrxStatusEnum } from '../../api/generated/merchants/RewardBatchTrxStatus';
import { useStore } from '../initiativeStores/StoreContext';
import InvoiceDetail from './detail/InvoiceDetail';

interface RouteParams {
  id: string;
}

interface InvoiceDataTableProps {
  batchId?: string;
  rewardBatchTrxStatus?: string;
  pointOfSaleId?: string;
}

const infoStyles = {
  fontWeight: 400,
  fontSize: 14,
};

const renderCellWithTooltip = (value: string, tooltipThreshold: number) => (
  <Tooltip
    title={value && value.length >= tooltipThreshold ? value : ''}
    placement="top"
    arrow={true}
  >
    <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
      {value && value !== '' ? value : '-'}
    </Typography>
  </Tooltip>
);

const InvoiceDataTable = ({
  batchId,
  rewardBatchTrxStatus,
  pointOfSaleId,
}: InvoiceDataTableProps) => {
  const [transactions, setTransactions] = useState<MerchantTransactionsListDTO>({
    content: [],
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
  });
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [rowDetail, setRowDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<RouteParams>();
  const [, setIsLoading] = useState(false);
  const addError = useErrorDispatcher();
  const { storeId } = useStore();

  const handleListButtonClick = (row: any) => {
    setRowDetail(row);
    setDrawerOpened(true);
  };

  const handleToggleDrawer = (open: boolean) => {
    setDrawerOpened(open);
    if (!open) {
      setRowDetail(null);
    }
  };

  const handlePaginationPageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageNo: page }));
  };

  const downloadFile = async (selectedTransaction: any, pointOfSaleId: string) => {
    setIsLoading(true);
    try {
      const response = await downloadInvoiceFile(selectedTransaction?.id, pointOfSaleId);
      window.open(response.invoiceUrl, '_blank');

      setIsLoading(false);
    } catch (error) {
      addError({
        id: 'FILE_DOWNLOAD',
        blocking: false,
        error: new Error('Merchant ID not found'),
        techDescription: 'Merchant ID not found',
        displayableTitle: 'Errore downloand file',
        displayableDescription: 'Non è stato possibile scaricare il file',
        toNotify: true,
        component: 'Toast',
        showCloseIcon: true,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getMerchantTransactionsProcessed({
      initiativeId: id,
      page: pagination.pageNo,
      size: pagination.pageSize,
      rewardBatchId: batchId,
      rewardBatchTrxStatus,
      pointOfSaleId,
    })
      .then((data) => {
        setTransactions(data);
        setPagination({
          pageNo: data.pageNo,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
        });
      })
      .finally(() => setLoading(false));
  }, [pagination.pageNo, pagination.pageSize, batchId, rewardBatchTrxStatus, pointOfSaleId]);

  const columns: Array<GridColDef> = [
    {
      field: 'invoiceFileName',
      headerName: 'Fattura',
      flex: 2,
      sortable: false,
      renderCell: (params: any) => (
        <Tooltip
          title={params.value && params.value.length >= 11 ? params.value : ''}
          placement="top"
          arrow
        >
          <Typography
            color="primary"
            sx={{
              ...infoStyles,
              maxWidth: '100% !important',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            className="ShowDots"
            onClick={() => downloadFile(params.row, storeId)}
          >
            {params.value && params.value !== '' ? params.value : '-'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'additionalProperties.productName',
      headerName: 'Prodotto',
      flex: 2,
      sortable: false,
      renderCell: (params: any) =>
        renderCellWithTooltip(params.row.additionalProperties?.productName || '-', 11),
    },
    {
      field: 'trxChargeDate',
      headerName: 'Data e ora',
      flex: 2,
      sortable: false,
      valueGetter: (params: any) => params.row.trxChargeDate,
      renderCell: (params: any) => renderCellWithTooltip(safeFormatDate(params.value), 11),
    },
    {
      field: 'effectiveAmountCents',
      headerName: 'Rimborso richiesto',
      flex: 2,
      sortable: false,
      renderCell: (params: any) =>
        renderCellWithTooltip(
          (params.value / 100).toLocaleString('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
          }),
          11
        ),
    },
    {
      field: 'rewardBatchTrxStatus',
      headerName: 'Stato',
      flex: 1.5,
      sortable: false,
      renderCell: (params: any) => <StatusChipInvoice status={params.value} />,
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
          <IconButton onClick={() => handleListButtonClick(params.row)} size="small">
            <ChevronRightIcon data-testid={params.row.trxId} color="primary" fontSize="inherit" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const tableRows = transactions.content.map((row) => ({ ...row, id: row.trxId }));

  return (
    <Box sx={{ my: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      />
      {loading ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 'auto', width: '100%' }}>
          <DataTable
            rows={tableRows}
            columns={columns}
            rowsPerPage={pagination.pageSize}
            paginationModel={pagination}
            onPaginationPageChange={handlePaginationPageChange}
            checkable={false}
          />
        </Box>
      )}
      {!loading && transactions.content.length === 0 && (
        <Paper
          sx={{
            my: 4,
            p: 3,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2">Nessuna richiesta di rimborso trovata.</Typography>
        </Paper>
      )}
      <DetailDrawer open={drawerOpened} toggleDrawer={handleToggleDrawer}>
        {rowDetail && (
          <InvoiceDetail
            title="Dettaglio transazione"
            itemValues={rowDetail}
            listItem={[
              {
                label: 'Data e ora',
                id: 'trxChargeDate',
                type: TYPE_TEXT.Text,
                format: (val: any) => safeFormatDate(val),
              },
              {
                label: 'Elettrodomestico',
                id: 'additionalProperties.productName',
                type: TYPE_TEXT.Text,
              },
              {
                label: 'Codice Fiscale Beneficiario',
                id: 'fiscalCode',
                type: TYPE_TEXT.Text,
              },
              {
                label: 'ID transazione',
                id: 'trxId',
                type: TYPE_TEXT.Text,
                bold: true,
              },
              {
                label: 'Codice sconto',
                id: 'trxCode',
                type: TYPE_TEXT.Text,
              },
              {
                label: 'Totale della spesa',
                id: 'effectiveAmountCents',
                type: TYPE_TEXT.Currency,
                bold: true,
              },
              {
                label: 'Sconto applicato',
                id: 'rewardAmountCents',
                type: TYPE_TEXT.Currency,
              },
              {
                label: 'Importo autorizzato',
                id: 'authorizedAmountCents',
                type: TYPE_TEXT.Currency,
              },
            ]}
          />
        )}
      </DetailDrawer>
    </Box>
  );
};

export default InvoiceDataTable;
