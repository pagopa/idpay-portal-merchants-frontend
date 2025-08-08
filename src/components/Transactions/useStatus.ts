import { theme } from "@pagopa/mui-italia";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";


const getStatus: any = (status: string) => {

    switch (status) {
        case 'CREATED':
            return { color: theme.palette.primary.light as string, label: 'Rimborso richiesto' };
        case 'AUTHORIZATION_REQUESTED':
            return { color: theme.palette.warning.extraLight as string, label: 'Da autorizzare' };
            break;
        case 'REJECTED':
            return { color: theme.palette.error.extraLight as string, label: 'Annullato' };
            break;
        case 'IDENTIFIED':
            return { color: theme.palette.warning.extraLight as string, label: 'Stornato' };
            break;
        case 'AUTHORIZED':
            return { color: theme.palette.success.extraLight as string, label: 'Autorizzato' };
            break;
        default:
            return { color: theme.palette.action.disabled as string, label: MISSING_DATA_PLACEHOLDER };
            break;

    }
};


export default getStatus; 