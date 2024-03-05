/* eslint-disable functional/immutable-data */
import { Chip } from '@mui/material';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
import { FormikProps } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { StatusEnum as TransactionCreatedStatusEnum } from '../../api/generated/merchants/MerchantTransactionDTO';
import { StatusEnum as TransactionProcessedStatusEnum } from '../../api/generated/merchants/MerchantTransactionProcessedDTO';

export enum TransactionTypeEnum {
  PROCESSED,
  NOT_PROCESSED,
}

export const renderTransactionCreatedStatus = (status: TransactionCreatedStatusEnum) => {
  switch (status) {
    case TransactionCreatedStatusEnum.AUTHORIZED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.authorized')}
          color="info"
        />
      );
    case TransactionCreatedStatusEnum.AUTHORIZATION_REQUESTED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.authorizationRequested')}
          color="default"
        />
      );
    case TransactionCreatedStatusEnum.CREATED:
    case TransactionCreatedStatusEnum.IDENTIFIED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.identified')}
          color="default"
        />
      );
    case TransactionCreatedStatusEnum.REJECTED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.invalidated')}
          color="error"
        />
      );
  }
};

export const renderTrasactionProcessedStatus = (status: TransactionProcessedStatusEnum) => {
  switch (status) {
    case TransactionProcessedStatusEnum.REWARDED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.rewarded')}
          color="success"
        />
      );
    case TransactionProcessedStatusEnum.CANCELLED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.cancelled')}
          color="error"
        />
      );
    default:
      return null;
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
  { width: '15%', label: 'pages.initiativeDiscounts.discountStatus' },
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
