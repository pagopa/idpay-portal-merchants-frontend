import { MerchantApi } from '../api/MerchantsApiClient';
import { MerchantsApiMocked } from '../api/__mocks__/MerchantsApiClient';
import { InitiativeDTOArray } from '../api/generated/merchants/InitiativeDTOArray';
import { MerchantDetailDTO } from '../api/generated/merchants/MerchantDetailDTO';
import { MerchantStatisticsDTO } from '../api/generated/merchants/MerchantStatisticsDTO';
import { MerchantTransactionsListDTO } from '../api/generated/merchants/MerchantTransactionsListDTO';
import { MerchantTransactionsProcessedListDTO } from '../api/generated/merchants/MerchantTransactionsProcessedListDTO';
import { TransactionResponse } from '../api/generated/merchants/TransactionResponse';

export const getMerchantInitiativeList = (): Promise<InitiativeDTOArray> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
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
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
    return MerchantsApiMocked.getMerchantTransactions(initiativeId, page, fiscalCode, status);
  }
  return MerchantApi.getMerchantTransactions(initiativeId, page, fiscalCode, status);
};

export const getMerchantTransactionsProcessed = (
  initiativeId: string,
  page: number,
  fiscalCode?: string,
  status?: string
): Promise<MerchantTransactionsProcessedListDTO> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
    return MerchantsApiMocked.getMerchantTransactionsProcessed(
      initiativeId,
      page,
      fiscalCode,
      status
    );
  }
  return MerchantApi.getMerchantTransactionsProcessed(initiativeId, page, fiscalCode, status);
};

export const getMerchantInitiativeStatistics = (
  initiativeId: string
): Promise<MerchantStatisticsDTO> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
    return MerchantsApiMocked.getMerchantInitiativeStatistics(initiativeId);
  }
  return MerchantApi.getMerchantInitiativeStatistics(initiativeId);
};

export const getMerchantDetail = (initiativeId: string): Promise<MerchantDetailDTO> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
    return MerchantsApiMocked.getMerchantDetail(initiativeId);
  }
  return MerchantApi.getMerchantDetail(initiativeId);
};

export const deleteTransaction = (transactionId: string): Promise<void> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
    return MerchantsApiMocked.deleteTransaction(transactionId);
  }
  return MerchantApi.deleteTransaction(transactionId);
};

export const createTransaction = (
  amountCents: number,
  idTrxAcquirer: string,
  initiativeId: string,
  mcc: string | undefined
): Promise<TransactionResponse> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
    return MerchantsApiMocked.createTransaction(amountCents, idTrxAcquirer, initiativeId, mcc);
  }
  return MerchantApi.createTransaction(amountCents, idTrxAcquirer, initiativeId, mcc);
};

export const authPaymentBarCode = (
  trxCode: string,
  amountCents: number,
  idTrxAcquirer: string
): Promise<any> => {
  if (process.env.REACT_APP_API_MOCK_MERCHANTS_PORTAL === 'true') {
    return MerchantsApiMocked.authPaymentBarCode(trxCode, amountCents, idTrxAcquirer);
  }
  return MerchantApi.authPaymentBarCode(trxCode, amountCents, idTrxAcquirer);
};
