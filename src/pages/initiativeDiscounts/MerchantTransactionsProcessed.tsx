import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { formatDate, formattedCurrency } from '../../helpers';
import { getMerchantTransactionsProcessed } from '../../services/merchantService';
import { pagesTableContainerStyle } from '../../styles';
import EmptyList from '../components/EmptyList';
import { MerchantTransactionProcessedDTO } from '../../api/generated/merchants/MerchantTransactionProcessedDTO';
import {
  TransactionsComponentProps,
  renderTrasactionProcessedStatus,
  // resetForm,
  tableHeadData,
} from './helpers';
import FiltersForm from './FiltersForm';
import TableHeader from './TableHeader';
import TablePaginator from './TablePaginator';
import { useTableDataFiltered } from './useTableDataFiltered';
import { useMemoInitTableData } from './useMemoInitTableData';

const MerchantTransactionsProcessed = ({ id }: TransactionsComponentProps) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const [rows, setRows] = useState<Array<MerchantTransactionProcessedDTO>>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [filterDataByUser, setFilterDataByUser] = useState<string | undefined>();
  const [filterDataByStatus, setFilterDataByStatus] = useState<string | undefined>();
  const setLoading = useLoading('GET_INITIATIVE_MERCHANT_DISCOUNTS_LIST');
  const addError = useErrorDispatcher();

  const formik = useFormik({
    initialValues: {
      searchUser: '',
      filterStatus: '',
    },
    onSubmit: (values: any) => {
      if (typeof id === 'string') {
        const fU = values.searchUser.length > 0 ? values.searchUser : undefined;
        const fS = values.filterStatus.length > 0 ? values.filterStatus : undefined;
        setFilterDataByUser(fU);
        setFilterDataByStatus(fS);
        getTableData(id, 0, fU, fS);
      }
    },
  });

  // const filterByStatusOptionsList = [
  //   { value: 'REWARDED', label: t('commons.discountStatusEnum.rewarded') },
  //   { value: 'CANCELLED', label: t('commons.discountStatusEnum.cancelled') },
  // ];

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
          id: 'GET_INITIATIVE_MERCHANT_DISCOUNTS_PROCESSED_LIST_ERROR',
          blocking: false,
          error,
          techDescription: 'An error occurred getting initiative merchant discounts processed list',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      })
      .finally(() => setLoading(false));
  };

  useMemoInitTableData(id, setPage, setFilterDataByUser, setFilterDataByStatus);
  useTableDataFiltered(id, page, filterDataByUser, filterDataByStatus, getTableData, setRows);

  return (
    <Box sx={{ width: '100%' }}>
      <FiltersForm
        formik={formik}
        // resetForm={() =>
        //   resetForm(id, formik, setFilterDataByUser, setFilterDataByStatus, setRows, getTableData)
        // }
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
                <TableHeader data={tableHeadData} />
                <TableBody sx={{ backgroundColor: 'white' }}>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(r.updateDate)}</TableCell>
                      <TableCell>{r.fiscalCode}</TableCell>
                      <TableCell>{formattedCurrency(r.effectiveAmountCents, '-', true)}</TableCell>
                      <TableCell>{formattedCurrency(r.rewardAmountCents, '-', true)}</TableCell>
                      <TableCell>{renderTrasactionProcessedStatus(r.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePaginator
                page={page}
                setPage={setPage}
                totalElements={totalElements}
                rowsPerPage={rowsPerPage}
              />
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
