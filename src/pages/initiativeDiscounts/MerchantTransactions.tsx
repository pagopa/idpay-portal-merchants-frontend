
import {
  Box, FormControl, Grid, InputLabel, MenuItem, Select,
  TextField, Chip
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { GridColDef } from '@mui/x-data-grid';
import {
  MerchantTransactionDTO,
} from '../../api/generated/merchants/MerchantTransactionDTO';
import EmptyList from '../components/EmptyList';
import DataTable from '../../components/dataTable/DataTable';
import FiltersForm from './FiltersForm';


const StatusChip = ({status}: any) => {
  /* eslint-disable functional/no-let */
  let color = '';
  let label = '';
  switch (status) {
    case 'CREATED':
      color = 'default';
      label = 'Rimborso richiesto';
      break;
    case 'AUTHORIZATION_REQUESTED':
      color = 'default';
      label = 'Da autorizzare';
      break;
    case 'REJECTED':
      color = 'error';
      label = 'Annullato';
      break;
    case 'REWARDED':
      color = 'success';
      label = 'Stornato';
      break;
    default:
      color = 'default';
      label = 'Default';
  }
  return <Chip label={label} color={color as any} size="small" />;
};




interface MerchantTransactionsProps {
  id: string;
  transactions: Array<MerchantTransactionDTO>;
}



const MerchantTransactions = ({transactions }: MerchantTransactionsProps) => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [rows, setRows] = useState<Array<MerchantTransactionDTO>>([]);

  useEffect(() => {
    if (transactions.length > 0) {
      console.log(transactions);
      setRows([...transactions]);
    }
  }, [transactions]);

  const formik = useFormik({
    initialValues: {
      
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

  // const rows2 = [
  //   {
  //     trxCode: "3lezemi7",
  //     trxId: "287b1eed-8032-46f9-8b8a-bd27a0192b0a_1749541238286",
  //     fiscalCode: "BRTVNL63E26X000U",
  //     effectiveAmountCents: 200,
  //     rewardAmountCents: 0,
  //     trxDate: "2025-07-20T09:40:38.286",
  //     trxExpirationSeconds: 300,
  //     updateDate: "2025-07-20T09:40:56.027",
  //     status: "CANCELLED",
  //     channel: "IDPAYCODE"
  //   },
  //   {
  //     trxCode: "4lezemi1",
  //     trxId: "956b1eed-8032-46f9-8b8a-bd27a0192b0a_1749541238286",
  //     fiscalCode: "BLBGRC27A05X000D",
  //     effectiveAmountCents: 400,
  //     rewardAmountCents: 0,
  //     trxDate: "2025-07-12T09:40:38.286",
  //     trxExpirationSeconds: 300,
  //     updateDate: "2025-07-12T09:40:56.027",
  //     status: "IDENTIFIED",
  //     channel: "IDPAYCODE"
  //   }
  // ];

  const handleFiltersApplied = () => {
    console.log('Callback dopo applicazione filtri');
  };

  const handleFiltersReset = () => {
    console.log('Callback dopo reset filtri');
  };

  return (
    <Box width={'100%'}>
      <FiltersForm
        formik={formik}
        onFiltersApplied={handleFiltersApplied}
        onFiltersReset={handleFiltersReset}
      >
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl fullWidth size="small">
            <TextField
              label={t('pages.initiativeDiscounts.searchByFiscalCode')}
              placeholder={t('pages.initiativeDiscounts.searchByFiscalCode')}
              name="searchUser"
              aria-label="searchUser"
              role="input"
              InputLabelProps={{ required: false }}
              // value={formik.values.searchUser}
              onChange={(e) => formik.handleChange(e)}
              size="small"
              data-testid="searchUser-test"
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
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
              // value={formik.values.filterStatus}
            >
              {filterByStatusOptionsList.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('pages.initiativeDiscounts.filterByStatus')}</InputLabel>
            <Select
              id="filterStatus"
              inputProps={{
                'data-testid': 'filterStatus-select',
              }}
              name="filterStatus"
              label={t('pages.initiativeDiscounts.filterByStatus')}
              placeholder={t('pages.initiativeDiscounts.filterByStatus')}
              onChange={(e) => formik.handleChange(e)}
              // value={formik.values.filterStatus}
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

        <Box sx={{ width: '100%', height: 500 }}>
          <DataTable
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPage={10}
            handleRowAction={(row: any) => {
              console.log(row);
            }} 
            // onSortModelChange={handleSortModelChange} 
            // sortModel={sortModel} 
            // paginationModel={storesPagination}
            // onPaginationPageChange={handlePaginationPageChange}
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
