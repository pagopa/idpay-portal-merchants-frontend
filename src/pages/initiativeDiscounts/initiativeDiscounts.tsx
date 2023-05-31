import MoreIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { ButtonNaked, theme } from '@pagopa/mui-italia';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useFormik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import {
  MerchantTransactionDTO,
  StatusEnum as TransactionStatusEnum,
} from '../../api/generated/merchants/MerchantTransactionDTO';
import ROUTES, { BASE_ROUTE } from '../../routes';
import { getMerchantTransactions } from '../../services/merchantService';
import {
  genericContainerStyle,
  initiativePagesFiltersFormContainerStyle,
  initiativePagesTableContainerStyle,
} from '../../styles';
import BreadcrumbsBox from '../components/BreadcrumbsBox';
import EmptyList from '../components/EmptyList';
interface MatchParams {
  id: string;
}

const InitiativeDiscounts = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const [rows, setRows] = useState<Array<MerchantTransactionDTO>>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [filterByFiscalCode, setFilterByFiscalCode] = useState<string | undefined>();
  const [filterByStatus, setFilterByStatus] = useState<string | undefined>();

  const setLoading = useLoading('GET_INITIATIVE_MERCHANT_DISCOUNTS_LIST');
  const addError = useErrorDispatcher();

  const match = matchPath(location.pathname, {
    path: [ROUTES.DISCOUNTS],
    exact: true,
    strict: false,
  });
  const { id } = (match?.params as MatchParams) || {};

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
          displayableTitle: t('errors.title'),
          displayableDescription: t('errors.getDataDescription'),
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
      getTableData(id, page, filterByFiscalCode, filterByStatus);
    }
  }, [id, page]);

  const formik = useFormik({
    initialValues: {
      searchByFiscalCode: '',
      filterStatus: '',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (typeof id === 'string') {
        const fiscalCode =
          values.searchByFiscalCode.length > 0
            ? values.searchByFiscalCode.toUpperCase()
            : undefined;
        setFilterByFiscalCode(fiscalCode);
        const status = values.filterStatus.length > 0 ? values.filterStatus : undefined;
        setFilterByStatus(status);
        getTableData(id, 0, fiscalCode, status);
      }
    },
  });

  const resetForm = () => {
    const initialValues = {
      searchByFiscalCode: '',
      filterStatus: '',
    };
    formik.resetForm({ values: initialValues });
    setFilterByFiscalCode(undefined);
    setFilterByStatus(undefined);
    setRows([]);
    if (typeof id === 'string') {
      getTableData(id, 0, undefined, undefined);
    }
  };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <BreadcrumbsBox
          backUrl={`${BASE_ROUTE}`}
          backLabel={'Indietro'}
          items={['Iniziative', 'TODO', 'Buoni sconto']}
        />
      </Box>
      <Box sx={{ ...genericContainerStyle, alignItems: 'baseline' }}>
        <Box sx={{ display: 'grid', gridColumn: 'span 10', mt: 2 }}>
          <TitleBox
            title={'Buoni sconto'}
            subTitle={'Visualizza e gestisci i buoni sconto emessi per l’iniziativa.'}
            mbTitle={3}
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
          />
        </Box>
        <Box sx={{ display: 'grid', gridColumn: 'span 2', mt: 2, justifyContent: 'right' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              console.log('TODO go to wizard');
            }}
            data-testid="goToWizard-btn-test"
          >
            {'Crea buono sconto'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridColumn: 'span 12', mt: 4, mb: 3 }}>
        <Typography variant="h6">{'Buoni sconto emessi'}</Typography>
      </Box>

      <Box sx={initiativePagesFiltersFormContainerStyle}>
        <FormControl sx={{ gridColumn: 'span 4' }}>
          <TextField
            label={'Cerca per codice fiscale'}
            placeholder={'Cerca per codice fiscale'}
            name="searchByFiscalCode"
            aria-label="searchByFiscalCode"
            role="input"
            InputLabelProps={{ required: false }}
            value={formik.values.searchByFiscalCode}
            onChange={(e) => formik.handleChange(e)}
            size="small"
            data-testid="searchByFiscalCode-test"
          />
        </FormControl>
        <FormControl sx={{ gridColumn: 'span 2' }} size="small">
          <InputLabel>{'Stato'}</InputLabel>
          <Select
            id="filterStatus"
            inputProps={{
              'data-testid': 'filterStatus-select',
            }}
            name="filterStatus"
            label={'Stato'}
            placeholder={'Stato'}
            onChange={(e) => formik.handleChange(e)}
            value={formik.values.filterStatus}
          >
            <MenuItem
              value={TransactionStatusEnum.AUTHORIZED}
              data-testid="filterStatusAuthorized-test"
            >
              {TransactionStatusEnum.AUTHORIZED}
            </MenuItem>
            <MenuItem value={TransactionStatusEnum.CREATED} data-testid="filterStatusCreated-test">
              {TransactionStatusEnum.CREATED}
            </MenuItem>
            <MenuItem
              value={TransactionStatusEnum.IDENTIFIED}
              data-testid="filterStatusIdentified-test"
            >
              {TransactionStatusEnum.IDENTIFIED}
            </MenuItem>
            <MenuItem
              value={TransactionStatusEnum.REJECTED}
              data-testid="filterStatusRejected-test"
            >
              {TransactionStatusEnum.REJECTED}
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ gridColumn: 'span 1' }}>
          <Button
            sx={{ py: 2, height: '44px' }}
            variant="outlined"
            size="small"
            onClick={() => formik.handleSubmit()}
            data-testid="apply-filters-test"
          >
            {'Filtra'}
          </Button>
        </FormControl>
        <FormControl sx={{ gridColumn: 'span 1' }}>
          <ButtonNaked
            component="button"
            sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.865rem' }}
            onClick={resetForm}
          >
            {'Rimuovi filtri'}
          </ButtonNaked>
        </FormControl>
      </Box>

      {rows.length > 0 ? (
        <Box
          sx={{
            ...initiativePagesTableContainerStyle,
            mt: 3,
          }}
        >
          <Box sx={{ display: 'grid', gridColumn: 'span 12', height: '100%' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="20%">Data e ora</TableCell>
                    <TableCell width="40%">Beneficiario</TableCell>
                    <TableCell width="15%">Importo</TableCell>
                    <TableCell width="15%">Stato</TableCell>
                    <TableCell width="5%"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: 'white' }}>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography> {r.updateDate?.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>{r.fiscalCode}</TableCell>
                      <TableCell>{r.effectiveAmount}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          data-testid="open-modal-discount-arrow"
                          onClick={() => console.log('open-modal')}
                        >
                          <MoreIcon color="primary" />
                        </IconButton>
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
        <EmptyList message={'Non ci sono buoni sconto in corso per questa iniziativa.'} />
      )}
    </Box>
  );
};

export default InitiativeDiscounts;
