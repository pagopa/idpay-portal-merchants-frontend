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
  [RewardBatchTrxStatusEnum.TO_CHECK]: { label: 'Da esaminare', color: '#EEEEEE' },
  [RewardBatchTrxStatusEnum.CONSULTABLE]: { label: 'Consultabile', color: '#EEEEEE' },
  [RewardBatchTrxStatusEnum.SUSPENDED]: { label: 'Da controllare', color: '#FFF5DA' },
  [RewardBatchTrxStatusEnum.APPROVED]: {
    label: 'Approvata',
    color: '#E1F5FE',
    textColor: '#224021',
  },
  [RewardBatchTrxStatusEnum.REJECTED]: {
    label: 'Esclusa',
    color: '#FFE0E0',
    textColor: '#215C76',
  },
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
