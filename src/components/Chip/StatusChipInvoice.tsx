import React from 'react';
import { RewardBatchTrxStatus } from '../../api/generated/merchants/data-contracts';
import CustomChip from './CustomChip';

type StatusChipProps = {
  status: RewardBatchTrxStatus;
};

const statusMap: Record<
  RewardBatchTrxStatus,
  { label: string; color: string; textColor?: string }
> = {
  [RewardBatchTrxStatus.TO_CHECK]: { label: 'Da esaminare', color: '#EEEEEE' },
  [RewardBatchTrxStatus.CONSULTABLE]: { label: 'Consultabile', color: '#EEEEEE' },
  [RewardBatchTrxStatus.SUSPENDED]: { label: 'Da controllare', color: '#FFF5DA' },
  [RewardBatchTrxStatus.APPROVED]: {
    label: 'Approvata',
    color: '#E1F5FE',
    textColor: '#215C76',
  },
  [RewardBatchTrxStatus.REJECTED]: {
    label: 'Esclusa',
    color: '#FFE0E0',
    textColor: '#761F1F',
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
