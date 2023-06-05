import { MerchantApi } from '../api/MerchantsApiClient';
import { MerchantsApiMocked } from '../api/__mocks__/MerchantsApiClient';
import { InitiativeDTO } from '../api/generated/merchants/InitiativeDTO';
import { MerchantDetailDTO } from '../api/generated/merchants/MerchantDetailDTO';
import { MerchantStatisticsDTO } from '../api/generated/merchants/MerchantStatisticsDTO';
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

export const getMerchantInitiativeStatistics = (
  initiativeId: string
): Promise<MerchantStatisticsDTO> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS === 'true') {
    return MerchantsApiMocked.getMerchantInitiativeStatistics(initiativeId);
  }
  return MerchantApi.getMerchantInitiativeStatistics(initiativeId);
};

export const getMerchantDetail = (initiativeId: string): Promise<MerchantDetailDTO> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS === 'true') {
    return MerchantsApiMocked.getMerchantDetail(initiativeId);
  }
  return MerchantApi.getMerchantDetail(initiativeId);
};
