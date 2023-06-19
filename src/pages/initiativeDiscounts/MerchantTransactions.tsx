import MoreIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
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
import { getMerchantTransactions } from '../../services/merchantService';
import { pagesTableContainerStyle } from '../../styles';
import EmptyList from '../components/EmptyList';
import AuthorizeTransactionModal from './AuthorizeTransactionModal';
import CancelTransactionModal from './CancelTransactionModal';
import { TransactionTypeEnum, renderTrasactionStatus } from './helpers';

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
    switch (status) {
      case TransactionStatusEnum.IDENTIFIED:
      case TransactionStatusEnum.CREATED:
      case TransactionStatusEnum.REJECTED:
        return (
          <>
            <MenuItem
              data-testid="authorize-trx-button"
              onClick={() => setOpenAuthorizeTrxModal(true)}
            >
              {t('pages.initiativeDiscounts.requestAuthorization')}
            </MenuItem>
            <AuthorizeTransactionModal
              openAuthorizeTrxModal={openAuthorizeTrxModal}
              setOpenAuthorizeTrxModal={setOpenAuthorizeTrxModal}
              data={data}
            />
          </>
        );
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
      default:
        return null;
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
    <TableCell align="right">
      <IconButton
        id={`actions_button-${trxId}`}
        aria-controls={open ? `actions-menu_${trxId}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClickActionsMenu}
        data-testid="menu-open-test"
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

  const showActionMenu = (status: TransactionStatusEnum) => {
    switch (status) {
      case TransactionStatusEnum.AUTHORIZED:
      case TransactionStatusEnum.CREATED:
      case TransactionStatusEnum.IDENTIFIED:
      case TransactionStatusEnum.REJECTED:
        return true;
      default:
        return false;
    }
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
                      <TableCell>{formattedCurrency(r.effectiveAmount)}</TableCell>
                      <TableCell>{formattedCurrency(r.rewardAmount)}</TableCell>
                      <TableCell>
                        {renderTrasactionStatus(r.status, TransactionTypeEnum.NOT_PROCESSED)}
                      </TableCell>
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
        <EmptyList message={t('pages.initiativeDiscounts.emptyList')} />
      )}
    </Box>
  );
};

export default MerchantTransactions;
