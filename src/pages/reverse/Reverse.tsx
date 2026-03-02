import FileUploadAction from '../FileUploadAction/FileUploadAction';
import { reversalTransactionInvoiced } from '../../services/merchantService';
import { ENV } from '../../utils/env';

const Reverse = () => (
  <FileUploadAction
    apiCall={reversalTransactionInvoiced}
    successStateKey="reverseUploadSuccess"
    breadcrumbsLabel={'Storico transazioni'}
    manualLink={ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK}
    i18nBlockKey="reverse"
  />
);

export default Reverse;
