import { useTranslation } from 'react-i18next';
import { updateInvoiceTransaction } from '../../services/merchantService';
import FileUploadAction from '../FileUploadAction/FileUploadAction';
import ROUTES from '../../routes';
import { ENV } from '../../utils/env';

const ModifyDocument = () => {
  const { t } = useTranslation();

  return (
    <FileUploadAction
      titleKey="pages.modifyDocument.title"
      subtitleKey=""
      i18nBlockKey="pages.modifyDocument"
      apiCall={updateInvoiceTransaction}
      successStateKey="refundUploadSuccess"
      breadcrumbsLabelKey={t('routes.refund')}
      breadcrumbsProp={{
        label: t('routes.refundManagement'),
        path: ROUTES.REFUND_REQUESTS,
      }}
      manualLink={ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK}
      docNumberTitle={t('pages.modifyDocument.invoiceTitle')}
      docNumberInsert={t('pages.modifyDocument.insertInvoice')}
      docNumberLabel={t('pages.modifyDocument.invoiceLabel')}
    />
  );
};

export default ModifyDocument;
