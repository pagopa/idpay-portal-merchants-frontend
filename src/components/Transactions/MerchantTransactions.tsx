
import {  Box, FormControl, Grid, InputLabel, MenuItem, Select,TextField, } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { PAGINATION_SIZE } from '../../utils/constants';
import { PointOfSaleTransactionDTO } from '../../api/generated/merchants/PointOfSaleTransactionDTO';
import EmptyList from '../../pages/components/EmptyList';
import { currencyFormatter } from '../../utils/formatUtils';

import DetailDrawer from '../Drawer/DetailDrawer';
import FiltersForm from '../../pages/initiativeDiscounts/FiltersForm';
import CustomChip from '../Chip/CustomChip';
import TransactionDataTable from './TransactionDataTable';
import TransactionDetail from './TransactionDetail';
import getStatus from './useStatus';
import getDetailFieldList from './useDetailList';


const StatusChip = ({ status }: any) => {
  const chipItem=getStatus(status);
  return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
};




interface MerchantTransactionsProps {
  transactions: Array<PointOfSaleTransactionDTO>;
  handleFiltersApplied: (filters: any) => void;
  handleFiltersReset: () => void;
  handleSortChange?: (sortModel: GridSortModel) => void;
  sortModel?: GridSortModel;
  handlePaginationPageChange?: (page: number) => void;
  paginationModel?: any;
}



const MerchantTransactions = ({ transactions, handleFiltersApplied, handleFiltersReset, handleSortChange, sortModel, handlePaginationPageChange, paginationModel }: MerchantTransactionsProps) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Array<PointOfSaleTransactionDTO>>([]);
  const [rowDetail, setRowDetail] = useState<Array<PointOfSaleTransactionDTO>>([]);
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const listItemDetail=getDetailFieldList();

  useEffect(() => {
    setRows([...transactions]);
  }, [transactions]);

  const formik = useFormik<any>({
    initialValues: {
      fiscalCode: '',
      status: '',
      page: 0
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const filterByStatusOptionsList = [
    { value: 'IDENTIFIED', label: t('commons.discountStatusEnum.identified') },
    { value: 'AUTHORIZED', label: t('commons.discountStatusEnum.authorized') },
    { value: 'REJECTED', label: t('commons.discountStatusEnum.invalidated') },
  ];
  const columns: Array<GridColDef> = [
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
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'effectiveAmountCents',
      headerName: 'Totale della spesa',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'rewardAmountCents',
      headerName: 'Importo autorizzato',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      valueFormatter: (params: any) => currencyFormatter(params.value),
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // sortable: false,
      renderCell: (params: any) => (
        <StatusChip status={params.value} />
      ),
    },
  ];

  const handleOnFiltersApplied = (filters: any) => {
    console.log('Callback dopo applicazione filtri', filters);
    if (handleFiltersApplied) { handleFiltersApplied(filters); }
  };

  const handleOnFiltersReset = () => {
    console.log('Callback dopo reset filtri');
    if (handleFiltersReset) { handleFiltersReset(); }
  };

  const handleSortModelChange = async (newSortModel: GridSortModel) => {
    if (handleSortChange) { handleSortChange(newSortModel); }
  };

  const onPaginationChange = (page: number) => {
    if (handlePaginationPageChange) { handlePaginationPageChange(page); }
  };

  const handleListButtonClick = (row: any) => {
    // setDrawerData(row);
    console.log("row", row);
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
      >
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl fullWidth size="small">
            <TextField
              label={t('pages.initiativeDiscounts.searchByFiscalCode')}
              placeholder={t('pages.initiativeDiscounts.searchByFiscalCode')}
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

        {/* <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>{'Categoria'}</InputLabel>
            <Select
              id="filterCategory"
              inputProps={{
                'data-testid': 'filterCategory-select',
              }}
              name="filterCategory"
              label={'Categoria'}
              placeholder={'Seleziona una categoria'}
              onChange={(e) => formik.handleChange(e)}
              value={formik.values.status}
            >
              {filterByStatusOptionsList.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid> */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
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
            >
              {filterByStatusOptionsList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
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
        <TransactionDetail itemValues={rowDetail} listItem={listItemDetail}/>
      </DetailDrawer>
    </Box>
  );
};

export default MerchantTransactions;
