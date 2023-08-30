import MoreIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import { itIT } from '@mui/material/locale';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useFormik } from 'formik';
import {
  MerchantTransactionDTO,
  StatusEnum as TransactionStatusEnum,
} from '../../api/generated/merchants/MerchantTransactionDTO';
import { formatDate, formattedCurrency } from '../../helpers';
import { getMerchantTransactions } from '../../services/merchantService';
import { genericContainerStyle, pagesTableContainerStyle } from '../../styles';
import EmptyList from '../components/EmptyList';
import AuthorizeTransactionModal from './AuthorizeTransactionModal';
import CancelTransactionModal from './CancelTransactionModal';
import { renderTransactionCreatedStatus } from './helpers';

type ActionsMenuProps = {
  initiativeId: string;
  status: TransactionStatusEnum;
  trxId: string;
  data: MerchantTransactionDTO;
};

const ActionMenu = ({ initiativeId, status, trxId, data }: ActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openCancelTrxModal, setOpenCancelTrxModal] = useState<boolean>(false);
  const [openAuthorizeTrxModal, setOpenAuthorizeTrxModal] = useState<boolean>(false);
  // const [openPaymentConfirmedToast, setOpenPaymentConfirmedToast] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();
  // const addError = useErrorDispatcher();

  const handleClickActionsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseActionsMenu = () => {
    setAnchorEl(null);
  };

  type RenderCancelTrxProps = {
    initiativeId: string;
    status: TransactionStatusEnum;
    trxId: string;
  };

  type RenderAuthorizeTrxProps = {
    data: MerchantTransactionDTO;
  };

  // type RenderConfirmPaymentProps = {
  //   status: TransactionStatusEnum;
  //   trxId: string;
  // };

  const RenderAuthorizeTransaction = ({ data }: RenderAuthorizeTrxProps) => {
    switch (data.status) {
      case TransactionStatusEnum.IDENTIFIED:
      case TransactionStatusEnum.CREATED:
        return (
          <>
            <MenuItem
              data-testid="authorize-trx-button"
              onClick={() => setOpenAuthorizeTrxModal(true)}
            >
              {t('pages.initiativeDiscounts.detailTitle')}
            </MenuItem>
            <AuthorizeTransactionModal
              openAuthorizeTrxModal={openAuthorizeTrxModal}
              setOpenAuthorizeTrxModal={setOpenAuthorizeTrxModal}
              data={data}
            />
          </>
        );
      case TransactionStatusEnum.REJECTED:
      default:
        return null;
    }
  };

  const RenderCancelTransaction = ({ initiativeId, status, trxId }: RenderCancelTrxProps) => {
    switch (status) {
      case TransactionStatusEnum.AUTHORIZED:
      case TransactionStatusEnum.IDENTIFIED:
      case TransactionStatusEnum.CREATED:
      case TransactionStatusEnum.REJECTED:
        return (
          <>
            <MenuItem data-testid="cancel-trx-button" onClick={() => setOpenCancelTrxModal(true)}>
              {t('pages.initiativeDiscounts.cancelDiscount')}
            </MenuItem>
            <CancelTransactionModal
              openCancelTrxModal={openCancelTrxModal}
              setOpenCancelTrxModal={setOpenCancelTrxModal}
              initiativeId={initiativeId}
              trxId={trxId}
              status={status}
            />
          </>
        );
    }
  };

  // const handleConfirmPayment = (transactionId: string | undefined) => {
  //   if (typeof transactionId === 'string') {
  //     confirmPaymentQRCode(transactionId)
  //       .then((_response) => setOpenPaymentConfirmedToast(true))
  //       .catch((error) => {
  //         addError({
  //           id: 'CONFIRM_PAYMENT_QR_CODE_ERROR',
  //           blocking: false,
  //           error,
  //           techDescription: 'An error occurred confirming payment qr code',
  //           displayableTitle: t('errors.genericTitle'),
  //           displayableDescription: t('errors.genericDescription'),
  //           toNotify: true,
  //           component: 'Toast',
  //           showCloseIcon: true,
  //         });
  //       });
  //   }
  // };

  // const RenderConfirmPayment = ({ status, trxId }: RenderConfirmPaymentProps) => {
  //   switch (status) {
  //     case TransactionStatusEnum.AUTHORIZED:
  //       return (
  //         <>
  //           <MenuItem onClick={() => handleConfirmPayment(trxId)}>
  //             {t('pages.initiativeDiscounts.confirmPayment')}
  //           </MenuItem>
  //           <Toast
  //             open={openPaymentConfirmedToast}
  //             title={t('pages.initiativeDiscounts.paymentConfirmed')}
  //             showToastCloseIcon={true}
  //             onCloseToast={() => setOpenPaymentConfirmedToast(false)}
  //           />
  //         </>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  return (
    <TableCell align="right" data-testid="tablecell-actions-menu">
      <IconButton
        id={`actions_button-${trxId}`}
        aria-controls={open ? `actions-menu_${trxId}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClickActionsMenu}
        data-testid="actions_button"
      >
        <MoreIcon color="primary" />
      </IconButton>
      <Menu
        id={`actions-menu_${trxId}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseActionsMenu}
        MenuListProps={{
          'aria-labelledby': `actions_button-${trxId}`,
        }}
        data-testid="menu-close-test"
      >
        <RenderAuthorizeTransaction data={data} />
        <RenderCancelTransaction initiativeId={initiativeId} trxId={trxId} status={status} />
        {/* <RenderConfirmPayment status={status} trxId={trxId} /> */}
      </Menu>
    </TableCell>
  );
};

interface Props {
  id: string;
}

const MerchantTransactions = ({ id }: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const [rows, setRows] = useState<Array<MerchantTransactionDTO>>([]);
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

  const showActionMenu = (status: TransactionStatusEnum) => {
    switch (status) {
      case TransactionStatusEnum.AUTHORIZED:
      case TransactionStatusEnum.CREATED:
      case TransactionStatusEnum.IDENTIFIED:
        return true;
      case TransactionStatusEnum.REJECTED:
        return false;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ ...genericContainerStyle, gap: 2, alignItems: 'baseline' }}>
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
            <MenuItem value={'IDENTIFIED'}>{t('commons.discountStatusEnum.identified')}</MenuItem>
            <MenuItem value={'AUTHORIZED'}>{t('commons.discountStatusEnum.authorized')}</MenuItem>
            <MenuItem value={'REJECTED'}>{t('commons.discountStatusEnum.invalidated')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ gridColumn: 'span 1' }}>
          <Button
            sx={{ height: '44.5px' }}
            variant="outlined"
            size="small"
            onClick={() => formik.handleSubmit()}
            data-testid="apply-filters-test"
          >
            {t('commons.filterBtn')}
          </Button>
        </FormControl>
        <FormControl sx={{ gridColumn: 'span 1' }}>
          <ButtonNaked
            component="button"
            sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.875rem' }}
            onClick={resetForm}
            data-testid="reset-filters-test"
          >
            {t('commons.removeFiltersBtn')}
          </ButtonNaked>
        </FormControl>
      </Box>

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
                    <TableCell width="5%"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: 'white' }}>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(r.updateDate)}</TableCell>
                      <TableCell>
                        {r.status === TransactionStatusEnum.AUTHORIZED ? r.fiscalCode : ''}
                      </TableCell>
                      <TableCell>{formattedCurrency(r.effectiveAmount, '-', true)}</TableCell>
                      <TableCell>{formattedCurrency(r.rewardAmount, '-', true)}</TableCell>
                      <TableCell>{renderTransactionCreatedStatus(r.status)}</TableCell>
                      {showActionMenu(r.status) ? (
                        <ActionMenu initiativeId={id} status={r.status} trxId={r.trxId} data={r} />
                      ) : (
                        <TableCell />
                      )}
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
          <EmptyList message={t('pages.initiativeDiscounts.emptyList')} />
        </Box>
      )}
    </Box>
  );
};

export default MerchantTransactions;
