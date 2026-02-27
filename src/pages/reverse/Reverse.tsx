import FileUploadAction from '../FileUploadAction/FileUploadAction';
import { reversalTransactionInvoiced } from '../../services/merchantService';

const Reverse = () => {
  const apiCall = async (trxId: string, _file: File, _pointOfSaleId: string, _docNumber?: string) =>
    reversalTransactionInvoiced(trxId);

  return (
    <FileUploadAction
      apiCall={apiCall}
      successStateKey="reverseUploadSuccess"
      breadcrumbsProp={{
        label: 'Storico rimborsi',
        path: '',
      }}
      manualLink=""
      i18nBlockKey="reverse"
    />
  );
};

export default Reverse;
