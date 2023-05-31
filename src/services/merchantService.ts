import { MerchantApi } from '../api/MerchantsApiClient';
import { MerchantsApiMocked } from '../api/__mocks__/MerchantsApiClient';
import { InitiativeDTO } from '../api/generated/merchants/InitiativeDTO';
import { MerchantTransactionsListDTO } from '../api/generated/merchants/MerchantTransactionsListDTO';

export const getMerchantInitiativeList = (): Promise<Array<InitiativeDTO>> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS === 'true') {
    return MerchantsApiMocked.getMerchantInitiativeList();
  }
  return MerchantApi.getMerchantInitiativeList();
};

export const getMerchantTransactions = (
  initiativeId: string,
  page: number,
  fiscalCode?: string,
  status?: string
): Promise<MerchantTransactionsListDTO> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS === 'true') {
    return MerchantsApiMocked.getMerchantTransactions(initiativeId, page, fiscalCode, status);
  }
  return MerchantApi.getMerchantTransactions(initiativeId, page, fiscalCode, status);
};
