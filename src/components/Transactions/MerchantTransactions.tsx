import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { useFormik } from 'formik';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PAGINATION_SIZE } from '../../utils/constants';
import EmptyList from '../../pages/components/EmptyList';
import FiltersForm from '../../pages/initiativeDiscounts/FiltersForm';
import CustomChip from '../Chip/CustomChip';
import { PointOfSaleTransactionProcessedDTO } from '../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
import { useAlert } from '../../hooks/useAlert';
import TransactionDataTable from './TransactionDataTable';
import TransactionDetail from './TransactionDetail';
import getStatus from './useStatus';
import getDetailFieldList from './useDetailList';
import CurrencyColumn from './CurrencyColumn';

interface MerchantTransactionsProps {
  transactions: Array<PointOfSaleTransactionProcessedDTO>;
  handleFiltersApplied: (filters: any) => void;
  handleFiltersReset: () => void;
  handleSortChange?: (sortModel: GridSortModel) => void;
  sortModel: GridSortModel;
  handlePaginationPageChange?: (page: number) => void;
  paginationModel?: any;
  dataTableIsLoading?: boolean;
}

const MerchantTransactions = ({
  transactions,
  handleFiltersApplied,
  handleFiltersReset,
  handleSortChange,
  sortModel,
  handlePaginationPageChange,
  paginationModel,
  dataTableIsLoading,
}: MerchantTransactionsProps) => {
  const { alert, setAlert } = useAlert();
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<PointOfSaleTransactionProcessedDTO>>([]);
  const [rowDetail, setRowDetail] = useState<Array<PointOfSaleTransactionProcessedDTO>>([]);
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState<boolean>(false);
  const [codeError, setCodeError] = useState<Record<string, string>>({gtinError: "", trxCodeError: ""});
  // const [gtinValue, setGtinValue] = useState<string>('');
  const listItemDetail = getDetailFieldList();

  const infoStyles = {
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.fontSize,
  };

  useEffect(() => {
    setRows([...transactions]);
  }, [transactions]);

  const formik = useFormik<any>({
    initialValues: {
      fiscalCode: '',
      productGtin: '',
      trxCode: '',
      status: '',
      page: 0,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const filterByStatusOptionsList = [
    { value: 'REFUNDED', label: t('commons.discountStatusEnum.refunded') },
    { value: 'CANCELLED', label: t('commons.discountStatusEnum.cancelled') },
    { value: 'REWARDED', label: t('commons.discountStatusEnum.rewarded') },
    { value: 'INVOICED', label: t('commons.discountStatusEnum.invoiced') },
  ];

  const StatusChip = ({ status }: any) => {
    const chipItem = getStatus(status);
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
      field: 'elettrodomestico',
      headerName: 'Elettrodomestico',
      flex: 2,
      editable: false,
      disableColumnMenu: true,
      valueGetter: (params) => params.row?.additionalProperties?.productName,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'trxChargeDate',
      headerName: 'Data e ora',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'fiscalCode',
      headerName: 'Beneficiario',
      flex: 1.2,
      editable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
    },
    {
      field: 'effectiveAmountCents',
      headerName: 'Totale della spesa',
      flex: 0.5,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value / 100} />,
    },
    {
      field: 'rewardAmountCents',
      headerName: 'Sconto applicato',
      flex: 0.5,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value / 100} />,
    },
    {
      field: 'authorizedAmountCents',
      headerName: 'Importo autorizzato',
      flex: 0.5,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value / 100} />,
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 1.1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => <StatusChip status={params.value} />,
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      flex: 0.1,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', width: '100%' }}>
          <IconButton onClick={() => handleListButtonClick(params.row)} size="small">
            <ChevronRightIcon color="primary" fontSize="inherit" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleOnFiltersApplied = (filters: any) => {
    console.log('Callback dopo applicazione filtri', filters);
    setFiltersAppliedOnce(true);
    if (handleFiltersApplied) {
      handleFiltersApplied(filters);
    }
  };

  const handleOnFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    setFiltersAppliedOnce(false);
    if (handleFiltersReset) {
      handleFiltersReset();
    }
  };

  const handleSortModelChange = async (newSortModel: GridSortModel) => {
    if (handleSortChange) {
      handleSortChange(newSortModel);
    }
  };

  const onPaginationChange = (page: number) => {
    if (handlePaginationPageChange) {
      handlePaginationPageChange(page);
    }
  };

  const handleListButtonClick = (row: any) => {
    setRowDetail(row);
    setDrawerOpened(true);
  };

  const handleToggleDrawer = () => {
    setAlert({ ...alert, isOpen: false });
    setDrawerOpened(false);
  };

  const handleCodeChange = useCallback((event: any, length: number, code: string) => {
    const value = event.target.value;
    const codeMap: Record<string, string> = {
      gtinError: "GTIN/EAN",
      trxCodeError: "sconto"
    };

    if (value.includes(' ') || value.length > length) {
      return;
    }

    const alphanumericRegex = /^[a-zA-Z0-9]*$/;

    if (!alphanumericRegex.test(value)) {
      setCodeError(prev => ({ ...prev, [code]: `Il codice ${codeMap[code]} deve contenere al massimo ${length} caratteri alfanumerici.`}));
      return;
    }

    setCodeError(prev => ({ ...prev, [code]: ""}));
    formik.handleChange(event);
  }, []);

  const renderCellWithTooltip = (value: string, tooltipThreshold: number) => (
    <Tooltip title={value && value.length >= tooltipThreshold ? value : ''}>
      <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
        {value && value !== '' ? value : '-'}
      </Typography>
    </Tooltip>
  );

  return (
    <Box width={'100%'}>
      <FiltersForm
        formik={formik}
        onFiltersApplied={handleOnFiltersApplied}
        onFiltersReset={handleOnFiltersReset}
        filtersAppliedOnce={filtersAppliedOnce}
      >
        <Grid item xs={12} sm={6} md={3} lg={2.5}>
          <FormControl fullWidth size="small">
            <TextField
              label={t('pages.pointOfSaleTransactions.searchByFiscalCode')}
              placeholder={t('pages.pointOfSaleTransactions.searchByFiscalCode')}
              name="fiscalCode"
              aria-label="searchUser"
              role="input"
              InputLabelProps={{ required: false }}
              value={formik.values.fiscalCode}
              onChange={(e) => formik.handleChange(e)}
              size="small"
              data-testid="searchUser-test"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2.5}>
          <FormControl fullWidth size="small">
            <TextField
              label={t('pages.pointOfSaleTransactions.searchByGtin')}
              placeholder={t('pages.pointOfSaleTransactions.searchByGtin')}
              name="productGtin"
              aria-label="searchGtin"
              role="input"
              InputLabelProps={{ required: false }}
              value={formik.values.productGtin}
              onChange={(e) => handleCodeChange(e, 14, "gtinError")}
              onBlur={() => setCodeError(prev => ({ ...prev, gtinError: ""}))}
              size="small"
              inputProps={{ maxLength: 14 }}
              error={!!codeError.gtinError}
              helperText={codeError.gtinError}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2.5}>
          <FormControl fullWidth size="small">
            <TextField
              label={t('pages.pointOfSaleTransactions.searchByTrxCode')}
              placeholder={t('pages.pointOfSaleTransactions.searchByTrxCode')}
              name="trxCode"
              aria-label="searchTrxCode"
              role="input"
              InputLabelProps={{ required: false }}
              value={formik.values.trxCode}
              onChange={(e) => handleCodeChange(e, 8, "trxCodeError")}
              onBlur={() => setCodeError(prev => ({ ...prev, trxCodeError: ""}))}
              size="small"
              inputProps={{ maxLength: 8 }}
              error={!!codeError.trxCodeError}
              helperText={codeError.trxCodeError}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2.5}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('pages.initiativeDiscounts.filterByStatus')}</InputLabel>
            <Select
              id="status"
              inputProps={{
                'data-testid': 'filterStatus-select',
              }}
              name="status"
              label={t('pages.initiativeDiscounts.filterByStatus')}
              placeholder={t('pages.initiativeDiscounts.filterByStatus')}
              onChange={formik.handleChange}
              value={formik.values.status}
              sx={{
                height: 44,
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: 0,
                  paddingBottom: 0,
                  height: '100%',
                },
              }}
            >
              {filterByStatusOptionsList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  <StatusChip status={item.value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </FiltersForm>
      {dataTableIsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      )}
      {rows.length > 0 && !dataTableIsLoading && (
        <Box mb={2} sx={{ width: '100%' }}>
          <TransactionDataTable
            rows={rows}
            columns={columns}
            pageSize={PAGINATION_SIZE}
            rowsPerPage={PAGINATION_SIZE}
            handleRowAction={(row: any) => handleListButtonClick(row)}
            onSortModelChange={handleSortModelChange}
            sortModel={sortModel}
            paginationModel={paginationModel}
            onPaginationPageChange={onPaginationChange}
          />
        </Box>
      )}
      {!dataTableIsLoading && rows.length === 0 && (
        <EmptyList message={t('pages.initiativeDiscounts.emptyList')} />
      )}
        <TransactionDetail
          data-testid="detail-drawer"
          isOpen={drawerOpened}
          setIsOpen={handleToggleDrawer}
          title="Dettaglio transazione"
          itemValues={rowDetail}
          listItem={listItemDetail}
        />
    </Box>
  );
};

export default MerchantTransactions;
