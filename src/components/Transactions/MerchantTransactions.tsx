
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField, } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { PAGINATION_SIZE } from '../../utils/constants';
import EmptyList from '../../pages/components/EmptyList';
import DetailDrawer from '../Drawer/DetailDrawer';
import FiltersForm from '../../pages/initiativeDiscounts/FiltersForm';
import CustomChip from '../Chip/CustomChip';
import { PointOfSaleTransactionProcessedDTO } from '../../api/generated/merchants/PointOfSaleTransactionProcessedDTO';
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
  sortModel?: GridSortModel;
  handlePaginationPageChange?: (page: number) => void;
  paginationModel?: any;
}



const MerchantTransactions = ({ transactions, handleFiltersApplied, handleFiltersReset, handleSortChange, sortModel, handlePaginationPageChange, paginationModel }: MerchantTransactionsProps) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<PointOfSaleTransactionProcessedDTO>>([]);
  const [rowDetail, setRowDetail] = useState<Array<PointOfSaleTransactionProcessedDTO>>([]);
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [filtersAppliedOnce, setFiltersAppliedOnce] = useState<boolean>(false);
  const listItemDetail = getDetailFieldList();

  useEffect(() => {
    setRows([...transactions]);
  }, [transactions]);

  const formik = useFormik<any>({
    initialValues: {
      fiscalCode: '',
      productGtin: '',
      status: '',
      page: 0
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const filterByStatusOptionsList = [
    { value: 'REFUNDED', label: t('commons.discountStatusEnum.refunded')},
    { value: 'CANCELLED', label: t('commons.discountStatusEnum.cancelled')},
    { value: 'REWARDED', label: t('commons.discountStatusEnum.rewarded')},
  ];

  const StatusChip = ({ status }: any) => {
    const chipItem = getStatus(status);
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="medium" textColorChip={chipItem?.textColor} />;
  };

  const columns: Array<GridColDef> = [
    {
      field: 'elettrodomestico',
      headerName: 'Elettrodomestico',
      flex: 2.2,
      editable: false,
      disableColumnMenu: true,
      valueGetter: (params) => params.row?.additionalProperties?.productName,
    },
    {
      field: 'updateDate',
      headerName: 'Data e ora',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'fiscalCode',
      headerName: 'Beneficiario',
      flex: 1.2,
      editable: false,
      sortable: false,
      disableColumnMenu: true,
    },
    {
      field: 'effectiveAmountCents',
      headerName: 'Totale della spesa',
      flex: 0.5,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value/100} />,
    },
    {
      field: 'rewardAmountCents',
      headerName: 'Sconto applicato',
      flex: 0.5,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value/100} />,
    },
    {
      field: 'authorizedAmountCents',
      headerName: 'Importo autorizzato',
      flex: 0.5,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params: any) => <CurrencyColumn value={params.value/100} />,
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 1.1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => <StatusChip status={params.value} />,
    },
  ];

  const handleOnFiltersApplied = (filters: any) => {
    console.log('Callback dopo applicazione filtri', filters);
    setFiltersAppliedOnce(true);
    if (handleFiltersApplied) { handleFiltersApplied(filters); }
  };

  const handleOnFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    setFiltersAppliedOnce(false);
    if (handleFiltersReset) { handleFiltersReset(); }
  };

  const handleSortModelChange = async (newSortModel: GridSortModel) => {
    if (handleSortChange) { handleSortChange(newSortModel); }
  };

  const onPaginationChange = (page: number) => {
    if (handlePaginationPageChange) { handlePaginationPageChange(page); }
  };

  const handleListButtonClick = (row: any) => {
    setRowDetail(row);
    setDrawerOpened(true);
  };

  const handleToggleDrawer = (newOpen: boolean) => {
    setDrawerOpened(newOpen);
  };

  return (
    <Box width={'100%'}>
      <FiltersForm
        formik={formik}
        onFiltersApplied={handleOnFiltersApplied}
        onFiltersReset={handleOnFiltersReset}
        filtersAppliedOnce={filtersAppliedOnce}
      >
        <Grid item xs={12} sm={6} md={3} lg={3}>
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
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl fullWidth size="small">
            <TextField
              label={t('pages.pointOfSaleTransactions.searchByGtin')}
              placeholder={t('pages.pointOfSaleTransactions.searchByGtin')}
              name="productGtin"
              aria-label="searchGtin"
              role="input"
              InputLabelProps={{ required: false }}
              value={formik.values.productGtin}
              onChange={(e) => formik.handleChange(e)}
              size="small"
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

      </FiltersForm >
      {rows.length > 0 ?

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
        :
        <EmptyList message={t('pages.initiativeDiscounts.emptyList')} />
      }
      <DetailDrawer
        data-testid="detail-drawer"
        open={drawerOpened}
        toggleDrawer={handleToggleDrawer}
      >
        <TransactionDetail title={"Dettaglio Transazione"} itemValues={rowDetail} listItem={listItemDetail} />
      </DetailDrawer>
    </Box>
  );
};

export default MerchantTransactions;
