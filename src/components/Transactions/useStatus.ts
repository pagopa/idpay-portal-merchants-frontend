import { theme } from "@pagopa/mui-italia";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";


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
        default:
            return { color: theme.palette.action.disabled as string, label: MISSING_DATA_PLACEHOLDER };
    }
};


export default getStatus; 