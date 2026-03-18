import { theme } from '@pagopa/mui-italia';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { StatusEnum } from '../../api/generated/merchants/RewardBatchDTO';

const getStatus: any = (status: string) => {
  switch (status) {
    case 'REWARDED':
      return { color: '#E1F4E1', label: 'Rimborso richiesto', textColor: '#224021' };
    case 'CANCELLED':
      return { color: '#FFE0E0', label: 'Annullato', textColor: '#761F1F' };
    case 'REFUNDED':
      return { color: '#C4DCF5', label: 'Stornato', textColor: '#17324D' };
    case 'INVOICED':
      return { color: '#E1F5FE', label: 'Preso in carico', textColor: '#215C76' };
    case 'CAPTURED':
      return { color: theme.palette.error.extraLight as string, label: 'Da rimborsare' };
    case 'AUTHORIZED':
      return { color: theme.palette.success.extraLight as string, label: 'Da autorizzare' };
    case 'CREATED':
      return { color: '#FFF5DA !important', textColor: '#614C15 !important', label: 'Da inviare' };
    case 'EVALUATING':
      return { color: '#EEEEEE', textColor: '#17324D !important', label: 'Preso in carico' };
    case 'APPROVED':
      return { color: '#E1F4E1', textColor: '#224021', label: 'Rimborso approvato' };
    case 'APPROVING':
      return { color: '#E1F5FE', textColor: '#215C76', label: 'In approvazione' };
    case 'SENT':
      return { color: '#EEEEEE', textColor: '#224021', label: 'Inviato' };
    default:
      return { color: theme.palette.action.disabled as string, label: MISSING_DATA_PLACEHOLDER };
  }
};

export const getBatchStatus: any = (batchStatus: StatusEnum) => {

  switch (batchStatus) {
    case StatusEnum.CREATED:
      return { color: '#FFF5DA !important', textColor: '#614C15 !important', label: 'Da inviare' };
    case StatusEnum.EVALUATING:
      return { color: '#EEEEEE', textColor: '#17324D !important', label: 'Preso in carico' };
    case StatusEnum.APPROVING:
      return { color: '#E1F5FE', textColor: '#215C76', label: 'In approvazione' };
    case StatusEnum.APPROVED:
      return { color: '#E1F4E1', textColor: '#224021', label: 'Rimborso approvato' };
    case StatusEnum.SENT:
      return { color: '#EEEEEE', textColor: '#224021', label: 'Inviato' };
    case StatusEnum.REFUNDED:
      return { color: '#DBF9FA', textColor: '#17324D', label: 'Rimborsato' };
    case StatusEnum.PENDING_REFUND:
      return { color: '#E7ECFC', textColor: '#17324D', label: 'In rimborso' };
    case StatusEnum.NOT_REFUNDED:
      return { color: '#FFE0E0', textColor: '#761F1F', label: 'Non rimborsato' };
    default:
      return { color: theme.palette.action.disabled as string, label: MISSING_DATA_PLACEHOLDER };
  }
};

export default getStatus; 