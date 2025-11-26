import React, { useState } from 'react';
import { Box, Stack, Tooltip, Typography, Checkbox, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DataTable from '../../components/dataTable/DataTable';
import CustomChip from '../../components/Chip/CustomChip';
import DetailDrawer from '../../components/Drawer/DetailDrawer';
import { TYPE_TEXT } from '../../utils/constants';
import { safeFormatDate } from '../../utils/formatUtils';

// MOCK conforme a MerchantTransactionsListDTO (swagger)
const merchantTransactionsListMock = {
  content: Array.from({ length: 10 }, (_, i) => {
    const trxId = `TRXID${i + 1}`;
    return {
      id: trxId,
      trxCode: `TRXCODE${i + 1}`,
      trxId,
      fiscalCode: `RSSMRA85T1${String(i + 1).padStart(2, '0')}A562S`,
      effectiveAmountCents: 50000 + i * 1000,
      rewardAmountCents: 10000 + i * 500,
      status: i % 2 === 0 ? 'REWARDED' : 'CANCELLED',
      trxDate: new Date(2025, 10, 10 + i, 14, 12).toISOString(),
      updateDate: new Date(2025, 10, 10 + i, 15, 0).toISOString(),
      docNumber: `FPR 19${i + 1}/25`,
      fileName: `Fattura_${i + 1}.pdf`,
      businessName: 'Euronics',
      channel: 'INSTORE',
      authorizedAmountCents: 40000 + i * 1000,
      rewardBatchId: `BATCH${i + 1}`,
      rewardBatchTrxStatus: i % 2 === 0 ? 'APPROVED' : 'TO_CHECK',
      rewardBatchRejectionReason: i % 3 === 0 ? 'Motivo di test' : undefined,
      rewardBatchInclusionDate: new Date(2025, 10, 10 + i, 16, 0).toISOString(),
      franchiseName: 'EURONICS DE RISI',
      pointOfSaleType: 'PHYSICAL',
      splitPayment: false,
      residualAmountCents: 0,
      qrcodePngUrl: '',
      qrcodeTxtUrl: '',
      additionalProperties: {
        productName: `Prodotto ${i + 1}`,
        discountCode: `DISC${i + 1}`,
      },
      pointOfSaleId: `POS${i + 1}`,
      trxChargeDate: new Date(2025, 10, 10 + i, 14, 30).toISOString(),
    };
  }),
  pageNo: 0,
  pageSize: 10,
  totalElements: 10,
  totalPages: 1,
};

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

import { RewardBatchTrxStatusEnum } from '../../api/generated/merchants/RewardBatchTrxStatus';
import InvoiceDetail from './detail/InvoiceDetail';

const StatusChip = ({ status }: { status: RewardBatchTrxStatusEnum }) => {
  const statusMap: Record<
    RewardBatchTrxStatusEnum,
    { label: string; color: 'default' | 'success' | 'warning' | 'error'; textColor?: string }
  > = {
    [RewardBatchTrxStatusEnum.TO_CHECK]: { label: 'Da esaminare', color: 'warning' },
    [RewardBatchTrxStatusEnum.CONSULTABLE]: { label: 'Consultabile', color: 'warning' },
    [RewardBatchTrxStatusEnum.SUSPENDED]: { label: 'Contrassegnata', color: 'warning' },
    [RewardBatchTrxStatusEnum.APPROVED]: { label: 'Validata', color: 'success' },
    [RewardBatchTrxStatusEnum.REJECTED]: { label: 'Rifiutata', color: 'error' },
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
    field: 'fileName',
    headerName: 'Fattura',
    flex: 3,
    sortable: false,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
  },
  {
    field: 'franchiseName',
    headerName: 'Punto vendita',
    flex: 2,
    sortable: false,
    renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
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
          <ChevronRightIcon data-testid={params.row.trxId} color="primary" fontSize="inherit" />
        </IconButton>
      </Box>
    ),
  },
];

const invoiceDataTable: React.FC = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [drawerOpened, setDrawerOpened] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [rowDetail, setRowDetail] = useState<any | null>(null);

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
          rows={merchantTransactionsListMock.content}
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
            ]}
          />
        )}
      </DetailDrawer>
    </Box>
  );
};

export default invoiceDataTable;
