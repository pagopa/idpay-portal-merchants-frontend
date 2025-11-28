import React from 'react';
import { RewardBatchTrxStatusEnum } from '../../api/generated/merchants/RewardBatchTrxStatus';
import CustomChip from './CustomChip';

type StatusChipProps = {
  status: RewardBatchTrxStatusEnum;
};

const statusMap: Record<
  RewardBatchTrxStatusEnum,
  { label: string; color: string; textColor?: string }
> = {
  [RewardBatchTrxStatusEnum.TO_CHECK]: { label: 'Da esaminare', color: '#EEEEEE' }, // warning (giallo)
  [RewardBatchTrxStatusEnum.CONSULTABLE]: { label: 'Consultabile', color: '#EEEEEE' }, // warning (giallo)
  [RewardBatchTrxStatusEnum.SUSPENDED]: { label: 'Contrassegnata', color: '#EEEEEE' }, // warning (giallo)
  [RewardBatchTrxStatusEnum.APPROVED]: {
    label: 'Validata',
    color: '#E1F4E1',
    textColor: '#224021',
  }, // success (verde)
  [RewardBatchTrxStatusEnum.REJECTED]: {
    label: 'Rifiutata',
    color: '#FFE0E0',
    textColor: '#761F1F',
  }, // error (rosso)
};

const StatusChipInvoice: React.FC<StatusChipProps> = ({ status }) => {
  const chipItem = statusMap[status] || { label: status, color: '#E0E0E0' };
  return (
    <CustomChip
      label={chipItem.label}
      colorChip={chipItem.color}
      sizeChip="small"
      textColorChip={chipItem.textColor}
    />
  );
};

export default StatusChipInvoice;
