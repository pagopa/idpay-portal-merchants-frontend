import { Chip } from '@mui/material';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
import { StatusEnum as TransactionStatusEnum } from '../../api/generated/merchants/MerchantTransactionDTO';

export enum TransactionTypeEnum {
  PROCESSED,
  NOT_PROCESSED,
}

export const renderTrasactionStatus = (status: string, type: TransactionTypeEnum) => {
  switch (status) {
    case TransactionStatusEnum.AUTHORIZED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.authorized')}
          color="info"
        />
      );
    case TransactionStatusEnum.CREATED:
    case TransactionStatusEnum.IDENTIFIED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.identified')}
          color="default"
        />
      );
    case TransactionStatusEnum.REJECTED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={
            type === TransactionTypeEnum.NOT_PROCESSED
              ? i18n.t('commons.discountStatusEnum.identified')
              : i18n.t('commons.discountStatusEnum.rejected')
          }
          color={type === TransactionTypeEnum.NOT_PROCESSED ? 'default' : 'error'}
        />
      );
    case TransactionStatusEnum.REWARDED:
      return (
        <Chip
          sx={{ fontSize: '14px' }}
          label={i18n.t('commons.discountStatusEnum.rewarded')}
          color="success"
        />
      );
    case TransactionStatusEnum.CANCELLED:
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
