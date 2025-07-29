
import {
  Box, FormControl, InputLabel, MenuItem, Select,
 TextField,
} from '@mui/material';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { GridColDef } from '@mui/x-data-grid';
import {
  MerchantTransactionDTO,
  // StatusEnum as TransactionStatusEnum,
} from '../../api/generated/merchants/MerchantTransactionDTO';
// import { formatDate, formattedCurrency } from '../../helpers';
import { getMerchantTransactions } from '../../services/merchantService';
import { pagesTableContainerStyle } from '../../styles';
import EmptyList from '../components/EmptyList';
// import ActionMenu from '../../components/actionMenu/actionMenu';
import DataTable from '../../components/dataTable/DataTable';
import {
  TransactionsComponentProps,
  
} from './helpers';
import FiltersForm from './FiltersForm';
import { useTableDataFiltered } from './useTableDataFiltered';
import { useMemoInitTableData } from './useMemoInitTableData';



const MerchantTransactions = ({ id }: TransactionsComponentProps) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [rows, setRows] = useState<Array<MerchantTransactionDTO>>([]);
  // const [rowsPerPage, setRowsPerPage] = useState<number>(0);
  // const [totalElements, setTotalElements] = useState<number>(0);
  const [filterByUser, setFilterByUser] = useState<string | undefined>();
  const [filterByStatus, setFilterByStatus] = useState<string | undefined>();
  const setLoading = useLoading('GET_INITIATIVE_MERCHANT_DISCOUNTS_LIST');
  const addError = useErrorDispatcher();

  const formik = useFormik({
    initialValues: {
      searchUser: '',
      filterStatus: '',
    },
    onSubmit: (values) => {
        const fU = values.searchUser.length > 0 ? values.searchUser : undefined;
        const fS = values.filterStatus.length > 0 ? values.filterStatus : undefined;
        setFilterByUser(fU);
        setFilterByStatus(fS);
        getTableData(id, 0, fU, fS);
    },
  });

  const filterByStatusOptionsList = [
    { value: 'IDENTIFIED', label: t('commons.discountStatusEnum.identified') },
    { value: 'AUTHORIZED', label: t('commons.discountStatusEnum.authorized') },
    { value: 'REJECTED', label: t('commons.discountStatusEnum.invalidated') },
  ];
  const columns: Array<GridColDef> = [
    {
      field: 'franchiseName',
      headerName: 'Franchise Name',
      width: 150,
      editable: true,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      editable: true,
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 150,
      editable: true,
    },
    {
      field: 'city',
      headerName: 'City',
      width: 150,
      editable: true,
    },
    {
      field: 'referent',
      headerName: 'Referent',
      width: 150,
      editable: true,
    },
    {
      field: 'contactEmail',
      headerName: 'Email',
      width: 150,
      editable: true,
    },

  ];
  const rows2 = [
    { id: 1, franchiseName: 'Snow', type: 'Jon', address: 'Jon', city: 'Jon', referent: 'Jon', contactEmail: 'Jon' },
    { id: 2, franchiseName: 'Lannister', type: 'Cersei', address: 'Cersei', city: 'Cersei', referent: 'Cersei', contactEmail: 'Cersei' },
    { id: 3, franchiseName: 'Lannister', type: 'Jaime', address: 'Jaime', city: 'Jaime', referent: 'Jaime', contactEmail: 'Jaime' },
    { id: 4, franchiseName: 'Stark', type: 'Arya', address: 'Arya', city: 'Arya', referent: 'Arya', contactEmail: 'Arya' },
    { id: 5, franchiseName: 'Targaryen', type: 'Daenerys', address: 'Daenerys', city: 'Daenerys', referent: 'Daenerys', contactEmail: 'Daenerys' },
    { id: 6, franchiseName: 'Melisandre', type: 'Daenerys', address: 'Daenerys', city: 'Daenerys', referent: 'Daenerys', contactEmail: 'Daenerys' },
    { id: 7, franchiseName: 'Clifford', type: 'Ferrara', address: 'Ferrara', city: 'Ferrara', referent: 'Ferrara', contactEmail: 'Ferrara' },
    { id: 8, franchiseName: 'Frances', type: 'Rossini', address: 'Rossini', city: 'Rossini', referent: 'Rossini', contactEmail: 'Rossini' },
    { id: 9, franchiseName: 'Roxie', type: 'Harvey', address: 'Harvey', city: 'Harvey', referent: 'Harvey', contactEmail: 'Harvey' },
  ];

  const getTableData = (
    initiativeId: string,
    page: number,
    fiscalCode: string | undefined,
    status: string | undefined
  ) => {
    setLoading(true);
    getMerchantTransactions(initiativeId, page, fiscalCode, status)
      .then((response) => {
        setPage(response.pageNo);
        // setRowsPerPage(response.pageSize);
        // setTotalElements(response.totalElements);
        if (response.content.length > 0) {
          setRows([...response.content]);
        } else {
          setRows([]);
        }
      })
      .catch((error) => {
        addError({
          id: 'GET_INITIATIVE_MERCHANT_DISCOUNTS_LIST_ERROR',
          blocking: false,
          error,
          techDescription: 'An error occurred getting initiative merchant discounts list',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      })
      .finally(() => setLoading(false));
  };

  useMemoInitTableData(id, setPage, setFilterByUser, setFilterByStatus);
  useTableDataFiltered(id, page, filterByUser, filterByStatus, getTableData, setRows);

  // const showActionMenu = (status: TransactionStatusEnum) => {
  //   switch (status) {
  //     case TransactionStatusEnum.AUTHORIZED:
  //     case TransactionStatusEnum.CREATED:
  //     case TransactionStatusEnum.IDENTIFIED:
  //       return true;
  //     case TransactionStatusEnum.AUTHORIZATION_REQUESTED:
  //     case TransactionStatusEnum.REJECTED:
  //       return false;
  //   }
  // };

  return (
    <Box width={'100%'}>
      <FiltersForm
        formik={formik}
        // resetForm={() =>
        //   resetForm(id, formik, setFilterByUser, setFilterByStatus, setRows, getTableData)
        // }
      >
        <FormControl sx={{ gridColumn: 'span 4' }}>
          <TextField
            label={t('pages.initiativeDiscounts.searchByFiscalCode')}
            placeholder={t('pages.initiativeDiscounts.searchByFiscalCode')}
            name="searchUser"
            aria-label="searchUser"
            role="input"
            InputLabelProps={{ required: false }}
            value={formik.values.searchUser}
            onChange={(e) => formik.handleChange(e)}
            size="small"
            data-testid="searchUser-test"
          />
        </FormControl>
        <FormControl sx={{ gridColumn: 'span 3' }} size="small">
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
            value={formik.values.filterStatus}
          >
            {filterByStatusOptionsList.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ gridColumn: 'span 2' }} size="small">
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
            value={formik.values.filterStatus}
          >
            {filterByStatusOptionsList.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
     </FiltersForm >
      {rows2.length > 0 ? (
        <Box
          sx={{
            ...pagesTableContainerStyle,
            mt: 3,
          }}
        >
          <Box sx={{ display: 'grid', gridColumn: 'span 12', height: '100%' }}>
            <Box sx={{ width: '100%' ,height: 500 }}>
              <DataTable rows={rows2} columns={columns} pageSize={5} rowsPerPage={5} handleRowAction={(row: any) => {
                console.log(row);
              }} />
            </Box>
          </Box>
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
