import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { itIT } from '@mui/material/locale';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MerchantTransactionDTO,
  StatusEnum as TransactionStatusEnum,
} from '../../api/generated/merchants/MerchantTransactionDTO';
import { formatDate, formattedCurrency } from '../../helpers';
import { getMerchantTransactionsProcessed } from '../../services/merchantService';
import { pagesTableContainerStyle } from '../../styles';
import EmptyList from '../components/EmptyList';
import { TransactionTypeEnum, renderTrasactionStatus } from './helpers';

interface Props {
  id: string;
}

const MerchantTransactionsProcessed = ({ id }: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const [rows, setRows] = useState<Array<MerchantTransactionDTO>>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const theme = createTheme(itIT);
  const setLoading = useLoading('GET_INITIATIVE_MERCHANT_DISCOUNTS_LIST');
  const addError = useErrorDispatcher();

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
        if (Array.isArray(response.content)) {
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

  useMemo(() => {
    setPage(0);
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof id === 'string') {
      getTableData(id, page, undefined, undefined);
    }
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
                    <TableCell width="15%">{'Totale della spesa'}</TableCell>
                    <TableCell width="15%">{'Importo autorizzato'}</TableCell>
                    <TableCell width="15%">
                      {t('pages.initiativeDiscounts.discountStatus')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: 'white' }}>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(r.updateDate)}</TableCell>
                      <TableCell>
                        {r.status === TransactionStatusEnum.AUTHORIZED ? r.fiscalCode : ''}
                      </TableCell>
                      <TableCell>{formattedCurrency(r.effectiveAmount)}</TableCell>
                      <TableCell>{formattedCurrency(r.rewardAmount)}</TableCell>
                      <TableCell>
                        {renderTrasactionStatus(r.status, TransactionTypeEnum.PROCESSED)}
                      </TableCell>
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
        <EmptyList message={t('pages.initiativeDiscounts.emptyList')} />
      )}
    </Box>
  );
};

export default MerchantTransactionsProcessed;
