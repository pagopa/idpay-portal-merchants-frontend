import {
  Box,
  // Button,
  // FormControl,
  // InputLabel,
  // MenuItem,
  // Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  // TextField,
} from '@mui/material';
import { itIT } from '@mui/material/locale';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { ButtonNaked } from '@pagopa/mui-italia';
import { useFormik } from 'formik';
import { formatDate, formattedCurrency } from '../../helpers';
import { getMerchantTransactionsProcessed } from '../../services/merchantService';
import {
  // genericContainerStyle,
  pagesTableContainerStyle,
} from '../../styles';
import EmptyList from '../components/EmptyList';
import { MerchantTransactionProcessedDTO } from '../../api/generated/merchants/MerchantTransactionProcessedDTO';
import { renderTrasactionProcessedStatus } from './helpers';
import FiltersForm from './FiltersForm';

interface Props {
  id: string;
}

const MerchantTransactionsProcessed = ({ id }: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const [rows, setRows] = useState<Array<MerchantTransactionProcessedDTO>>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [filterByUser, setFilterByUser] = useState<string | undefined>();
  const [filterByStatus, setFilterByStatus] = useState<string | undefined>();
  const theme = createTheme(itIT);
  const setLoading = useLoading('GET_INITIATIVE_MERCHANT_DISCOUNTS_LIST');
  const addError = useErrorDispatcher();

  const formik = useFormik({
    initialValues: {
      searchUser: '',
      filterStatus: '',
    },
    onSubmit: (values) => {
      if (typeof id === 'string') {
        const fU = values.searchUser.length > 0 ? values.searchUser : undefined;
        const fS = values.filterStatus.length > 0 ? values.filterStatus : undefined;
        setFilterByUser(fU);
        setFilterByStatus(fS);
        getTableData(id, 0, fU, fS);
      }
    },
  });

  const filterByStatusOptionsList = [
    { value: 'REWARDED', label: t('commons.discountStatusEnum.rewarded') },
    { value: 'CANCELLED', label: t('commons.discountStatusEnum.cancelled') },
  ];

  const getTableData = (
    initiativeId: string,
    page: number,
    fiscalCode: string | undefined,
    status: string | undefined
  ) => {
    setLoading(true);
    getMerchantTransactionsProcessed(initiativeId, page, fiscalCode, status)
      .then((response) => {
        setPage(response.pageNo);
        setRowsPerPage(response.pageSize);
        setTotalElements(response.totalElements);
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

  const resetForm = () => {
    const initialValues = { searchUser: '', filterStatus: '' };
    formik.resetForm({ values: initialValues });
    setFilterByUser(undefined);
    setFilterByStatus(undefined);
    setRows([]);
    if (typeof id === 'string') {
      getTableData(id, 0, undefined, undefined);
    }
  };

  useMemo(() => {
    setPage(0);
    setFilterByUser(undefined);
    setFilterByStatus(undefined);
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof id === 'string') {
      getTableData(id, page, filterByUser, filterByStatus);
    }
    return () => {
      setRows([]);
    };
  }, [id, page]);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    window.scrollTo(0, 0);
    setPage(newPage);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FiltersForm
        formik={formik}
        resetForm={resetForm}
        filterByStatusOptionsList={filterByStatusOptionsList}
      />

      {rows.length > 0 ? (
        <Box
          sx={{
            ...pagesTableContainerStyle,
            mt: 3,
          }}
        >
          <Box sx={{ display: 'grid', gridColumn: 'span 12', height: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="20%">{t('pages.initiativeDiscounts.dateAndHours')}</TableCell>
                    <TableCell width="40%">{t('pages.initiativeDiscounts.beneficiary')}</TableCell>
                    <TableCell width="15%">{t('pages.initiativeDiscounts.totalSpent')}</TableCell>
                    <TableCell width="15%">
                      {t('pages.initiativeDiscounts.authorizedAmount')}
                    </TableCell>
                    <TableCell width="15%">
                      {t('pages.initiativeDiscounts.discountStatus')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: 'white' }}>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(r.updateDate)}</TableCell>
                      <TableCell>{r.fiscalCode}</TableCell>
                      <TableCell>{formattedCurrency(r.effectiveAmount, '-', true)}</TableCell>
                      <TableCell>{formattedCurrency(r.rewardAmount, '-', true)}</TableCell>
                      <TableCell>{renderTrasactionProcessedStatus(r.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ThemeProvider theme={theme}>
                <TablePagination
                  sx={{
                    '.MuiTablePagination-displayedRows': {
                      fontFamily: '"Titillium Web",sans-serif',
                    },
                  }}
                  component="div"
                  onPageChange={handleChangePage}
                  page={page}
                  count={totalElements}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[10]}
                />
              </ThemeProvider>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <EmptyList message={t('pages.initiativeDiscounts.emptyProcessedList')} />
        </Box>
      )}
    </Box>
  );
};

export default MerchantTransactionsProcessed;
