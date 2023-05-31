import { MerchantsApiMocked } from '../../api/__mocks__/MerchantsApiClient';
import { InitiativeDTO } from '../../api/generated/merchants/InitiativeDTO';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/MerchantTransactionsListDTO';

export const getMerchantInitiativeList = (): Promise<Array<InitiativeDTO>> =>
  MerchantsApiMocked.getMerchantInitiativeList();

export const getMerchantTransactions = (
  initiativeId: string,
  page: number,
  fiscalCode: string,
  status: string
): Promise<MerchantTransactionsListDTO> =>
  MerchantsApiMocked.getMerchantTransactions(initiativeId, page, fiscalCode, status);
