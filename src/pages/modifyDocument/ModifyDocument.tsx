import { useLocation } from 'react-router-dom';
import { updateInvoiceTransaction } from '../../services/merchantService';
import FileUploadAction from '../FileUploadAction/FileUploadAction';
import ROUTES from '../../routes';
import { ENV } from '../../utils/env';

const ModifyDocument = () => {
  const location = useLocation<any>();

  const isFromStores = Boolean(location.state?.fromLocation);
  const breadcrumbLabel = isFromStores ? 'Punti vendita' : 'Richieste di rimborso';

  const breadcrumbPath = isFromStores ? ROUTES.STORES : ROUTES.REFUND_REQUESTS;

  return (
    <FileUploadAction
      apiCall={updateInvoiceTransaction}
      successStateKey="refundUploadSuccess"
      breadcrumbsProp={{
        label: breadcrumbLabel,
        path: breadcrumbPath,
      }}
      manualLink={ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK}
    />
  );
};

export default ModifyDocument;
