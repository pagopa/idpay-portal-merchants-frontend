import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import DataTable from '../../components/dataTable/DataTable';
import StatusChipInvoice from '../../components/Chip/StatusChipInvoice';
import {
  downloadInvoiceFile,
  getMerchantTransactionsProcessed,
  GetMerchantTransactionsProcessedParams,
} from '../../services/merchantService';
import { MISSING_DATA_PLACEHOLDER, TYPE_TEXT } from '../../utils/constants';
import { safeFormatDate } from '../../utils/formatUtils';
import { useAlert } from '../../hooks/useAlert';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/MerchantTransactionsListDTO';
import InvoiceDetail from './detail/InvoiceDetail';

interface RouteParams {
  id: string;
  batch_id: string;
}

interface InvoiceDataTableProps {
  rewardBatchTrxStatus?: string;
  pointOfSaleId?: string;
  trxCode?: string;
  fiscalCode?: string;
  onDrawerClosed?: () => void;
}

const infoStyles = {
  fontWeight: 400,
  fontSize: 14,
};

const renderCellWithTooltip = (value: string | JSX.Element) => (
  <Tooltip title={value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}>
    <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
      {value && value !== '' ? value : MISSING_DATA_PLACEHOLDER}
    </Typography>
  </Tooltip>
);

const InvoiceDataTable = ({
  rewardBatchTrxStatus,
  pointOfSaleId,
  trxCode,
  fiscalCode,
  onDrawerClosed,
}: InvoiceDataTableProps) => {
  const [transactions, setTransactions] = useState<MerchantTransactionsListDTO['content']>([]);
  const [pagination, setPagination] = useState({
    pageNo: 0,
    pageSize: 10,
    totalElements: 0,
  });
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [rowDetail, setRowDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'trxChargeDate', sort: 'desc' },
  ]);
  const { id, batch_id } = useParams<RouteParams>();
  const { alert, setAlert } = useAlert();
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleListButtonClick = (row: any) => {
    setRowDetail(row);
    setDrawerOpened(true);
  };

  const handleToggleDrawer = () => {
    setAlert({ ...alert, isOpen: false });
    setDrawerOpened(false);
  };

  const handleCloseDrawer = (open: boolean) => {
    setDrawerOpened(false);
    if (!open) {
      setRowDetail(null);
      onDrawerClosed?.();
    }
  };

  const downloadFile = async (selectedTransaction: any) => {
    try {
      setIsDownloading(true);

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
    } catch (error) {
      setAlert({
        title: 'Errore download file',
        text: 'Non è stato possibile scaricare il file',
        isOpen: true,
        severity: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const loadTransactions = async (
    params?: Omit<GetMerchantTransactionsProcessedParams, 'initiativeId'>
  ) => {
    setLoading(true);
    const filters = {
      ...(fiscalCode ? { fiscalCode } : {}),
      ...(rewardBatchTrxStatus ? { rewardBatchTrxStatus } : {}),
      ...(pointOfSaleId ? { pointOfSaleId } : {}),
      ...(trxCode ? { trxCode } : {}),
    };
    try {
      const response = await getMerchantTransactionsProcessed({
        initiativeId: id,
        size: pagination.pageSize,
        rewardBatchId: batch_id,
        ...filters,
        ...params
      });
      const { content, ...paginationData } = response;
      setPagination(paginationData);
      setTransactions(content ?? []);
    } catch {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions();
  }, [rewardBatchTrxStatus, pointOfSaleId, trxCode, fiscalCode]);

  const columns: Array<GridColDef> = [
    {
      field: 'invoiceFilename',
      headerName: 'Fattura',
      flex: 2,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Tooltip
          title={params.value && params.value !== '' ? params.value : MISSING_DATA_PLACEHOLDER}
        >
          <Typography
            color="primary"
            sx={{
              ...infoStyles,
              maxWidth: '100% !important',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            className="ShowDots"
            onClick={() => downloadFile(params.row)}
          >
            {params.value && params.value !== '' ? params.value : MISSING_DATA_PLACEHOLDER}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'franchiseName',
      headerName: 'Punto vendita',
      flex: 2,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) =>
        renderCellWithTooltip(params.row.franchiseName || MISSING_DATA_PLACEHOLDER),
    },
    {
      field: 'additionalProperties.productName',
      headerName: 'Elettrodomestico',
      flex: 2,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) =>
        renderCellWithTooltip(
          params.row.additionalProperties?.productName || MISSING_DATA_PLACEHOLDER
        ),
    },
    {
      field: 'trxChargeDate',
      headerName: 'Data e ora',
      flex: 2,
      sortable: true,
      disableColumnMenu: true,
      valueGetter: (params: any) => params.row.trxChargeDate,
      renderCell: (params: any) => renderCellWithTooltip(safeFormatDate(params.value)),
    },
    {
      field: 'rewardAmountCents',
      headerName: 'Rimborso richiesto',
      flex: 2,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) =>
        renderCellWithTooltip(
          (params.value / 100).toLocaleString('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
          })
        ),
    },
    {
      field: 'rewardBatchTrxStatus',
      headerName: 'Stato',
      flex: 1.5,
      sortable: false,
      disableColumnMenu: true,
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

  const handleSortModelChange = (model: GridSortModel) => {
    if (
      model.length === 0 ||
      (model.length === 1 &&
        model[0].field === 'trxChargeDate' &&
        (model[0].sort === 'asc' || model[0].sort === 'desc'))
    ) {
      setSortModel(model);
      void loadTransactions({
        ...(model[0]?.sort ? { sort: `trxChargeDate,${model[0].sort}` } : {}),
      });
    }
  };

  const handlePaginationPageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    void loadTransactions({ page });
  };

  const handleRowsPerPageChange = (newPageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageNo: 0,
      pageSize: newPageSize,
    }));
    void loadTransactions({ page: 0, size: newPageSize });
  };

  const tableRows = transactions.map((row: any) => ({
    ...row,
    id: row.trxId,
    invoiceFilename: row.invoiceData?.filename || '',
  }));

  return (
    <Box sx={{ my: 2, position: 'relative' }}>
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
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            isTransactionsPage={true}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      )}
      {isDownloading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            zIndex: (theme) => theme.zIndex.modal + 1,
            pointerEvents: 'all',
          }}
        />
      )}
      {!loading && transactions.length === 0 && (
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
      {rowDetail && (
        <InvoiceDetail
          onCloseDrawer={() => handleCloseDrawer(false)}
          isOpen={drawerOpened}
          setIsOpen={handleToggleDrawer}
          onSuccess={loadTransactions}
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
    </Box>
  );
};

export default InvoiceDataTable;
