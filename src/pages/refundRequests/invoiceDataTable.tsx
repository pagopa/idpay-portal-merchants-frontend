import React from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import DataTable from '../../components/dataTable/DataTable';
import CustomChip from '../../components/Chip/CustomChip';

const invoiceData = [
  {
    id: 1,
    invoiceNumber: 'INV-001',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 2,
    invoiceNumber: 'INV-002',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 3,
    invoiceNumber: 'INV-003',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 4,
    invoiceNumber: 'INV-004',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 5,
    invoiceNumber: 'INV-005',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 6,
    invoiceNumber: 'INV-006',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 7,
    invoiceNumber: 'INV-007',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 8,
    invoiceNumber: 'INV-008',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 9,
    invoiceNumber: 'INV-009',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
  {
    id: 10,
    invoiceNumber: 'INV-010',
    invoiceDate: '2021-03-24T14:12:00',
    amount: 100.0,
    status: 'TO_REVIEW',
  },
];

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
    TO_REVIEW: { label: 'Da esaminare', color: 'warning' },
    APPROVED: { label: 'Approvata', color: 'success' },
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

const columns = [
  {
    field: 'invoiceNumber',
    headerName: 'Fattura',
    flex: 3,
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
    headerName: 'Importo',
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
];
const InvoiceDataTable: React.FC = () => (
  <Box p={1.5}>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 2, md: 3 }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
    ></Stack>
    <Box sx={{ height: '400px' }}>
      <DataTable columns={columns} rows={invoiceData} rowsPerPage={10} checkable={false} />
    </Box>
  </Box>
);

export default InvoiceDataTable;
