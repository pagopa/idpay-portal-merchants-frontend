
import {
  Box, FormControl, Grid, InputLabel, MenuItem, Select,
  TextField, Chip,
  styled,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { theme } from '@pagopa/mui-italia';
import DataTable from '../../components/dataTable/DataTable';
import { MISSING_DATA_PLACEHOLDER, PAGINATION_SIZE } from '../../utils/constants';
import { PointOfSaleTransactionDTO } from '../../api/generated/merchants/PointOfSaleTransactionDTO';
import FiltersForm from './FiltersForm';
import EmptyStateGrid from './EmptyStateGrid';


const StatusChip = ({ status }: any) => {
  let chipItem = { color: '', label: '' };
  switch (status) {
    case 'CREATED':
      chipItem = { color: theme.palette.primary.light as string, label: 'Rimborso richiesto' };
      break;
    case 'AUTHORIZATION_REQUESTED':
      chipItem= {color : theme.palette.warning.extraLight as string, label : 'Da autorizzare'};
      break;
      case 'REJECTED':
      chipItem = { color: theme.palette.error.extraLight as string, label: 'Annullato' };
      break;
    case 'IDENTIFIED':
      chipItem = { color: theme.palette.warning.extraLight as string, label: 'Stornato' };
      break;
    case 'AUTHORIZED':
      chipItem = { color: theme.palette.success.extraLight as string, label: 'Autorizzato' };
      break;
    default:
      chipItem = { color: theme.palette.action.disabled as string, label: MISSING_DATA_PLACEHOLDER};
      break;
  }
  const CustomChip = styled(Chip)({
    [`&.MuiChip-filled`]: {
      backgroundColor: chipItem?.color
    }
  });
  return <CustomChip label={chipItem?.label} size="small" />;
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
      flex:1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'fiscalCode',
      headerName: 'Beneficiario',
      flex:1,
      editable: false,
      disableColumnMenu: true,
    },
    {
      field: 'effectiveAmountCents',
      headerName: 'Totale della spesa',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // sortable: false
    },
    {
      field: 'rewardAmountCents',
      headerName: 'Importo autorizzato',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      // sortable: false
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex:1,
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
       : 
        <EmptyStateGrid message={'pages.initiativeDiscounts.emptyList'} />
      }
    </Box>
  );
};

export default MerchantTransactions;
