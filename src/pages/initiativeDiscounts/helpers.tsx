import { Chip } from '@mui/material';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
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
    case TransactionCreatedStatusEnum.CREATED:
    case TransactionCreatedStatusEnum.IDENTIFIED:
    case TransactionCreatedStatusEnum.REJECTED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.identified')}
          color="default"
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
  }
};
