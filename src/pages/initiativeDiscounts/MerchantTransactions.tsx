
import {
  Box, FormControl, Grid, InputLabel, MenuItem, Select,
  TextField, Chip
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import EmptyList from '../components/EmptyList';
import DataTable from '../../components/dataTable/DataTable';
import { PAGINATION_SIZE } from '../../utils/constants';
import { PointOfSaleTransactionDTO } from '../../api/generated/merchants/PointOfSaleTransactionDTO';
import FiltersForm from './FiltersForm';


const StatusChip = ({ status }: any) => {
  /* eslint-disable functional/no-let */
  let color = '';
  let label = '';
  switch (status) {
    case 'CREATED':
      color = 'default';
      label = 'Rimborso richiesto';
      break;
    case 'AUTHORIZATION_REQUESTED':
      color = 'warning';
      label = 'Da autorizzare';
      break;
    case 'REJECTED':
      color = 'error';
      label = 'Annullato';
      break;
    case 'IDENTIFIED':
      color = 'warning';
      label = 'Stornato';
      break;
    case 'AUTHORIZED':
      color = 'success';
      label = 'Autorizzato';
      break;
  }
  return <Chip label={label} color={color as any} size="small" />;
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [rows, setRows] = useState<Array<PointOfSaleTransactionDTO>>([]);

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
      width: 200,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'fiscalCode',
      headerName: 'Beneficiario',
      width: 200,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'effectiveAmountCents',
      headerName: 'Totale della spesa',
      width: 200,
      editable: false,
      disableColumnMenu: true,
      sortable: false
    },
    {
      field: 'rewardAmountCents',
      headerName: 'Importo autorizzato',
      width: 200,
      editable: false,
      disableColumnMenu: true,
      sortable: false
    },
    {
      field: 'status',
      headerName: 'Stato',
      width: 200,
      editable: false,
      disableColumnMenu: true,
      sortable: false,
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
      {rows.length > 0 ? (

        <Box sx={{ width: '100%', height: 500, mb: 2 }}>
          <DataTable
            rows={rows}
            columns={columns}
            pageSize={PAGINATION_SIZE}
            rowsPerPage={PAGINATION_SIZE}
            handleRowAction={(row: any) => {
              console.log(row);
              // TODO Aggiungere redirect al dettaglio transazione
            }}
            onSortModelChange={handleSortModelChange}
            sortModel={sortModel}
            paginationModel={paginationModel}
            onPaginationPageChange={onPaginationChange}
          />
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <EmptyList message={t('pages.initiativeDiscounts.emptyList')} />
        </Box>
      )}
    </Box>
  );
};

export default MerchantTransactions;
