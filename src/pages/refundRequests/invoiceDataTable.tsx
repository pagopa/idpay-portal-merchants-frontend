import React, { useState } from 'react';
import { Box, Stack, Tooltip, Typography, Checkbox, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DataTable from '../../components/dataTable/DataTable';
import CustomChip from '../../components/Chip/CustomChip';
import DetailDrawer from '../../components/Drawer/DetailDrawer';
import { PointOfSaleTransactionProcessedDTO } from '../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
import { TYPE_TEXT } from '../../utils/constants';
import InvoiceDetail from './detail/InvoiceDetail';

const invoiceData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${String(i + 1).padStart(3, '0')}`,
  invoiceDate: '-',
  amount: 100.0,
  status: 'TO_REVIEW',
  puntoVendita: 'EURONICS DE RISI',
}));

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

const StatusChip = ({ status }: { status: string }) => {
  const statusMap: Record<
    string,
    { label: string; color: 'default' | 'success' | 'warning' | 'error'; textColor?: string }
  > = {
    TO_CHECK: { label: 'Da esaminare', color: 'warning' },
    CONSULTABLE: { label: 'Consultabile', color: 'warning' },
    SUSPENDED: { label: 'Contrassegnata', color: 'warning' },
    APPROVED: { label: 'Validata', color: 'success' },
    REJECTED: { label: 'Rifiutata', color: 'error' },
  };
  const chipItem = statusMap[status] || { label: status, color: 'default' };
  return (
    <CustomChip
      label={chipItem.label}
      colorChip={chipItem.color}
      sizeChip="small"
      textColorChip={chipItem.textColor}
    />
  );
};

const getColumns = (handleListButtonClick: (row: any) => void) => [
  {
    field: 'checkbox',
    headerName: '',
    width: 58,
    sortable: false,
    disableColumnMenu: true,
    renderHeader: () => <Checkbox disabled />,
    renderCell: () => <Checkbox disabled />,
  },
  {
    field: 'invoiceNumber',
    headerName: 'Fattura',
    flex: 3,
    sortable: false,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
  },
  {
    field: 'puntoVendita',
    headerName: 'Punto vendita',
    flex: 2,
    sortable: false,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
  },
  {
    field: 'invoiceDate',
    headerName: 'Data e ora',
    flex: 2,
    sortable: false,
    valueGetter: (params: any) => params.row.invoiceDate,
    renderCell: (params: any) =>
      renderCellWithTooltip(
        new Date(params.value).toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        11
      ),
  },
  {
    field: 'amount',
    headerName: 'Rimborso richiesto',
    flex: 2,
    sortable: false,
    renderCell: (params: any) =>
      renderCellWithTooltip(
        params.value.toLocaleString('it-IT', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
        }),
        11
      ),
  },
  {
    field: 'status',
    headerName: 'Stato',
    flex: 1.5,
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
        <IconButton onClick={() => handleListButtonClick(params.row)} size="small">
          <ChevronRightIcon data-testid={params.row.id} color="primary" fontSize="inherit" />
        </IconButton>
      </Box>
    ),
  },
];

const InvoiceDataTable: React.FC = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [rowDetail, setRowDetail] = useState<PointOfSaleTransactionProcessedDTO | null>(null);

  // MOCK DETTAGLIO: disabilita/commenta la riga con "mockDetail" per usare il dato reale della riga
  const mockDetail: PointOfSaleTransactionProcessedDTO = {
    additionalProperties: {
      productName: 'Lavatrice Electrolux EW7FEU492DP 914495009',
      discountCode: '4T6Y7UIF',
    },
    authorizedAmountCents: 40000 as any,
    effectiveAmountCents: 50000 as any,
    fiscalCode: 'ASDFOG43RTGFDSA',
    id: 'e5348bee-e342-4bb0-a551-42750bdf8d88',
    rewardAmountCents: 10000 as any,
    status: 'TO_REVIEW' as any,
    trxChargeDate: new Date('2021-03-24T14:12:00').toISOString() as any,
    invoiceFile: {
      docNumber: 'FPR 192/25',
      filename: 'Nome fattura',
    },
  };

  const handleListButtonClick = (row: any) => {
    console.log(row);
    // setRowDetail(row); // <-- usa questa riga per dettaglio reale
    setRowDetail(mockDetail); // <-- mock abilitato per tutte le righe
    setDrawerOpened(true);
  };

  const handleToggleDrawer = (open: boolean) => {
    setDrawerOpened(open);
    if (!open) {
      setRowDetail(null);
    }
  };

  const formatDateSafe = (val: any) => {
    if (!val) {
      return '-';
    }
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) {
      return '-';
    }
    return d.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box p={1.5}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      ></Stack>
      <Box>
        <DataTable
          columns={getColumns(handleListButtonClick)}
          rows={invoiceData}
          rowsPerPage={10}
          checkable={false}
        />
      </Box>
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
                format: (val: any) => formatDateSafe(val),
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
                id: 'id',
                type: TYPE_TEXT.Text,
                bold: true,
              },
              {
                label: 'Codice sconto',
                id: 'additionalProperties.discountCode',
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
              {
                label: 'Numero fattura',
                id: 'invoiceFile.docNumber',
                type: TYPE_TEXT.Text,
                bold: true,
              },
              {
                label: 'Fattura',
                id: 'invoiceFile.filename',
                type: TYPE_TEXT.Text,
              },
              {
                label: 'Stato',
                id: 'status',
                type: TYPE_TEXT.Text,
                render: (val: any) => <StatusChip status={val} />,
              },
            ]}
          />
        )}
      </DetailDrawer>
    </Box>
  );
};

export default InvoiceDataTable;
