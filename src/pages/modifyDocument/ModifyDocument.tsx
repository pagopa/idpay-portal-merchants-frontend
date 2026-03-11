import { useLocation } from 'react-router-dom';
import { updateInvoiceTransaction } from '../../services/merchantService';
import FileUploadAction from '../FileUploadAction/FileUploadAction';
import { ENV } from '../../utils/env';

const ModifyDocument = () => {
  const location = useLocation<any>();

  const isFromStores = Boolean(location.state?.fromLocation);
  const bLabel = isFromStores ? 'Punti vendita' : 'Richieste di rimborso';

  const updateInvoiceAdapter = (transactionId: string, file: File, docNumber: string) =>
    updateInvoiceTransaction(transactionId, file, docNumber);

  return (
    <FileUploadAction
      apiCall={updateInvoiceAdapter}
      successStateKey="refundUploadSuccess"
      breadcrumbsLabel={bLabel}
      manualLink={ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK}
      i18nBlockKey="modifyDocument"
    />
  );
};

export default ModifyDocument;
