import { MerchantApi } from '../api/MerchantsApiClient';
import { MerchantsApiMocked } from '../api/__mocks__/MerchantsApiClient';
import { InitiativeDTO } from '../api/generated/merchants/InitiativeDTO';

export const getMerchantInitiativeList = (): Promise<Array<InitiativeDTO>> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS === 'true') {
    return MerchantsApiMocked.getMerchantInitiativeList();
  }
  return MerchantApi.getMerchantInitiativeList();
};
