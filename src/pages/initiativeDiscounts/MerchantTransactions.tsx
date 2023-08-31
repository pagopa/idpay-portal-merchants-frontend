import MoreIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
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
import {
  TransactionsComponentProps,
  renderTransactionCreatedStatus,
  resetForm,
  tableHeadData,
} from './helpers';
import FiltersForm from './FiltersForm';
import TableHeader from './TableHeader';
import TablePaginator from './TablePaginator';

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
  const open = Boolean(anchorEl);
  const { t } = useTranslation();

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
      </Menu>
    </TableCell>
  );
};

const MerchantTransactions = ({ id }: TransactionsComponentProps) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const [rows, setRows] = useState<Array<MerchantTransactionDTO>>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
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
    { value: 'IDENTIFIED', label: t('commons.discountStatusEnum.identified') },
    { value: 'AUTHORIZED', label: t('commons.discountStatusEnum.authorized') },
    { value: 'REJECTED', label: t('commons.discountStatusEnum.invalidated') },
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
      <FiltersForm
        formik={formik}
        resetForm={() =>
          resetForm(id, formik, setFilterByUser, setFilterByStatus, setRows, getTableData)
        }
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
                <TableHeader data={[...tableHeadData, { width: '5%', label: '' }]} />
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
          <EmptyList message={t('pages.initiativeDiscounts.emptyList')} />
        </Box>
      )}
    </Box>
  );
};

export default MerchantTransactions;
