import { MerchantsApiMocked } from '../../api/__mocks__/MerchantsApiClient';
import { InitiativeDTO } from '../../api/generated/merchants/InitiativeDTO';

export const getMerchantInitiativeList = (): Promise<Array<InitiativeDTO>> =>
  MerchantsApiMocked.getMerchantInitiativeList();
