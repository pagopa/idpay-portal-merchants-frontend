import { useTranslation } from 'react-i18next';
import { updateInvoiceTransaction } from '../../services/merchantService';
import FileUploadAction from '../FileUploadAction/FileUploadAction';
import ROUTES from '../../routes';
import { ENV } from '../../utils/env';

const ModifyDocument = () => {
  const { t } = useTranslation();

  return (
    <FileUploadAction
      apiCall={updateInvoiceTransaction}
      successStateKey="refundUploadSuccess"
      breadcrumbsProp={{
        label: t('routes.refundManagement'),
        path: ROUTES.REFUND_REQUESTS,
      }}
      manualLink={ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK}
    />
  );
};

export default ModifyDocument;
