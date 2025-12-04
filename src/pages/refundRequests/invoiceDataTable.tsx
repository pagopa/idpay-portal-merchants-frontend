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
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import DataTable from '../../components/dataTable/DataTable';
import StatusChipInvoice from '../../components/Chip/StatusChipInvoice';
import DetailDrawer from '../../components/Drawer/DetailDrawer';
import {
  downloadInvoiceFile,
  getMerchantTransactionsProcessed,
} from '../../services/merchantService';
import { TYPE_TEXT } from '../../utils/constants';
import { safeFormatDate } from '../../utils/formatUtils';
import { useAlert } from '../../hooks/useAlert';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/MerchantTransactionsListDTO';
import InvoiceDetail from './detail/InvoiceDetail';

interface RouteParams {
  id: string;
}

interface InvoiceDataTableProps {
  batchId?: string;
  rewardBatchTrxStatus?: string;
  pointOfSaleId?: string;
  fiscalCode?: string;
}

const infoStyles = {
  fontWeight: 400,
  fontSize: 14,
};

const renderCellWithTooltip = (value: string | JSX.Element) => (
  <Tooltip title={value ? value : ''} placement="top" arrow={true}>
    <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
      {value && value !== '' ? value : '-'}
    </Typography>
  </Tooltip>
);

const InvoiceDataTable = ({
  batchId,
  rewardBatchTrxStatus,
  pointOfSaleId,
  fiscalCode,
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
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'trxChargeDate', sort: 'desc' },
  ]);
  const { id } = useParams<RouteParams>();
  const { alert, setAlert } = useAlert();

  const handleListButtonClick = (row: any) => {
    setRowDetail(row);
    setDrawerOpened(true);
  };

  const handleToggleDrawer = (open: boolean) => {
    setAlert({ ...alert, isOpen: open });
    setDrawerOpened(open);
    if (!open) {
      setRowDetail(null);
    }
  };
  const handleSortModelChange = (model: GridSortModel) => {
    if (
      model.length === 0 ||
      (model.length === 1 &&
        model[0].field === 'trxChargeDate' &&
        (model[0].sort === 'asc' || model[0].sort === 'desc'))
    ) {
      setSortModel(model);
    }
  };

  const handlePaginationPageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageNo: page }));
  };

  const downloadFile = async (selectedTransaction: any) => {
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
        },
        contentStyle: { position: 'unset', bottom: '0', right: '0' },
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    let sortParam: string | undefined;
    if (
      sortModel.length === 1 &&
      sortModel[0].field === 'trxChargeDate' &&
      (sortModel[0].sort === 'asc' || sortModel[0].sort === 'desc')
    ) {
      sortParam = `trxChargeDate,${sortModel[0].sort}`;
    }

    const params = {
      initiativeId: id,
      page: pagination.pageNo,
      size: pagination.pageSize,
      ...(sortParam ? { sort: sortParam } : {}),
      ...(fiscalCode ? { fiscalCode } : {}),
      ...(batchId ? { rewardBatchId: batchId } : {}),
      ...(rewardBatchTrxStatus ? { rewardBatchTrxStatus } : {}),
      ...(pointOfSaleId ? { pointOfSaleId } : {}),
    };

    getMerchantTransactionsProcessed(params)
      .then((data) => {
        setTransactions(data);
        setPagination({
          pageNo: data.pageNo,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
        });
      })
      .finally(() => setLoading(false));
  }, [
    pagination.pageNo,
    pagination.pageSize,
    batchId,
    rewardBatchTrxStatus,
    pointOfSaleId,
    sortModel,
    fiscalCode,
  ]);

  const columns: Array<GridColDef> = [
    {
      field: 'invoiceFilename',
      headerName: 'Fattura',
      flex: 2,
      sortable: false,
      disableColumnMenu: true,
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
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            className="ShowDots"
            onClick={() => downloadFile(params.row)}
          >
            {params.value && params.value !== '' ? params.value : '-'}
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
      renderCell: (params: any) => renderCellWithTooltip(params.row.franchiseName || '-'),
    },
    {
      field: 'additionalProperties.productName',
      headerName: 'Prodotto',
      flex: 2,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) =>
        renderCellWithTooltip(params.row.additionalProperties?.productName || '-'),
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

  const handleRowsPerPageChange = (newPageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageNo: 0,
      pageSize: newPageSize,
    }));
  };

  const tableRows = transactions.content.map((row: any) => ({
    ...row,
    id: row.trxId,
    invoiceFilename: row.invoiceData?.filename || '',
  }));

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
            paginationModel={{
              pageNo: pagination.pageNo,
              pageSize: pagination.pageSize,
              totalElements: pagination.totalElements,
            }}
            onPaginationPageChange={handlePaginationPageChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            isTransactionsPage={true}
            onRowsPerPageChange={handleRowsPerPageChange}
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
            storeId={rowDetail?.pointOfSaleId || ''}
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
