/* eslint-disable functional/immutable-data */
import { Chip } from '@mui/material';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { FormikProps } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { MerchantTransactionDTO } from '../../api/generated/merchants/data-contracts';

type TransactionCreatedStatusEnum = MerchantTransactionDTO['status'];
type TransactionStatusEnum = MerchantTransactionDTO['status'];

export enum TransactionTypeEnum {
  PROCESSED,
  NOT_PROCESSED,
}

export const renderTransactionCreatedStatus = (status: TransactionCreatedStatusEnum) => {
  switch (status) {
    case 'AUTHORIZED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.authorized'))}
          color="info"
        />
      );
    case 'AUTHORIZATION_REQUESTED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.authorizationRequested'))}
          color="default"
        />
      );
    case 'CREATED' as TransactionCreatedStatusEnum:
    case 'IDENTIFIED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.identified'))}
          color="default"
        />
      );
    case 'REJECTED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.invalidated'))}
          color="error"
        />
      );
    case 'REWARDED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.rewarded'))}
          color="success"
        />
      );
    case 'CANCELLED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.cancelled'))}
          color="error"
        />
      );
    case 'REFUNDED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.refunded'))}
          color="warning"
        />
      );
    case 'INVOICED' as TransactionCreatedStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.invoiced'))}
          color="primary"
        />
      );
  }
  return null;
};

export const renderTrasactionProcessedStatus = (status: TransactionStatusEnum) => {
  switch (status) {
    case 'REWARDED' as TransactionStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.rewarded'))}
          color="success"
        />
      );
    case 'CANCELLED' as TransactionStatusEnum:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.cancelled'))}
          color="error"
        />
      );
    default:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={String(i18n.t('enums.discountStatus.identified'))}
          color="default"
        />
      );
  }
};

export const mapDatesFromPeriod = (period: string | undefined) => {
  if (typeof period === 'string') {
    const dates = period.split(' - ');
    const startDateStr = `${dates[0].split('/').reverse().join('-')} 00:00:00`;
    const endDateStr = `${dates[1].split('/').reverse().join('-')} 23:59:59`;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return { startDate, endDate };
  }
  return undefined;
};

export const userCanCreateDiscount = (startDate: Date | undefined, endDate: Date | undefined) => {
  if (typeof startDate === 'object' && typeof endDate === 'object') {
    const now = new Date().getTime();
    const nowIsGreaterOrEqualThanStartDate = startDate.getTime() <= now;
    const nowIsLowerOrEqualThanEndDate = now <= endDate.getTime();
    return nowIsGreaterOrEqualThanStartDate && nowIsLowerOrEqualThanEndDate;
  }
  return true;
};

export const tableHeadData = [
  { width: '20%', label: 'pages.initiativeDiscounts.dateAndHours' },
  { width: '30%', label: 'pages.initiativeDiscounts.beneficiary' },
  { width: '15%', label: 'pages.initiativeDiscounts.totalSpent' },
  { width: '15%', label: 'pages.initiativeDiscounts.authorizedAmount' },
  { width: '15%', label: 'shared.labels.discountStatus' },
];

export interface TransactionsComponentProps {
  id: string;
}

export const resetForm = (
  initiativeId: string,
  formik: FormikProps<{ searchUser: string; filterStatus: string }>,
  setFilterByUser: Dispatch<SetStateAction<string | undefined>>,
  setFilterByStatus: Dispatch<SetStateAction<string | undefined>>,
  setRows: Dispatch<SetStateAction<Array<any>>>,
  getTableData: (
    initiativeId: string,
    page: number,
    fiscalCode: string | undefined,
    status: string | undefined
  ) => void
) => {
  const initialValues = { searchUser: '', filterStatus: '' };
  formik.resetForm({ values: initialValues });
  setFilterByUser(undefined);
  setFilterByStatus(undefined);
  setRows([]);
  if (typeof initiativeId === 'string') {
    getTableData(initiativeId, 0, undefined, undefined);
  }
};
