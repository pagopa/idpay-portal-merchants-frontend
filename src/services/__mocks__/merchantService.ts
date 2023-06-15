import { MerchantsApiMocked } from '../../api/__mocks__/MerchantsApiClient';
import { InitiativeDTOArray } from '../../api/generated/merchants/InitiativeDTOArray';
import { MerchantDetailDTO } from '../../api/generated/merchants/MerchantDetailDTO';
import { MerchantStatisticsDTO } from '../../api/generated/merchants/MerchantStatisticsDTO';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/MerchantTransactionsListDTO';
import { TransactionResponse } from '../../api/generated/merchants/TransactionResponse';

export const getMerchantInitiativeList = (): Promise<InitiativeDTOArray> =>
  MerchantsApiMocked.getMerchantInitiativeList();

export const getMerchantTransactions = (
  initiativeId: string,
  page: number,
  fiscalCode?: string,
  status?: string
): Promise<MerchantTransactionsListDTO> =>
  MerchantsApiMocked.getMerchantTransactions(initiativeId, page, fiscalCode, status);

export const getMerchantInitiativeStatistics = (
  initiativeId: string
): Promise<MerchantStatisticsDTO> =>
  MerchantsApiMocked.getMerchantInitiativeStatistics(initiativeId);

export const getMerchantDetail = (initiativeId: string): Promise<MerchantDetailDTO> =>
  MerchantsApiMocked.getMerchantDetail(initiativeId);

export const deleteTransaction = (transactionId: string): Promise<void> =>
  MerchantsApiMocked.deleteTransaction(transactionId);

export const createTransaction = (
  amountCents: number,
  idTrxIssuer: string,
  initiativeId: string,
  trxDate: Date,
  mcc: string | undefined
): Promise<TransactionResponse> =>
  MerchantsApiMocked.createTransaction(amountCents, idTrxIssuer, initiativeId, trxDate, mcc);

// export const confirmPaymentQRCode = (transactionId: string) =>
//   MerchantsApiMocked.confirmPaymentQRCode(transactionId);
