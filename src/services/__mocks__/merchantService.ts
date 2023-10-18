import { MerchantsApiMocked } from '../../api/__mocks__/MerchantsApiClient';
import { AuthPaymentResponseDTO } from '../../api/generated/merchants/AuthPaymentResponseDTO';
import { InitiativeDTOArray } from '../../api/generated/merchants/InitiativeDTOArray';
import { MerchantDetailDTO } from '../../api/generated/merchants/MerchantDetailDTO';
import { MerchantStatisticsDTO } from '../../api/generated/merchants/MerchantStatisticsDTO';
import { MerchantTransactionsListDTO } from '../../api/generated/merchants/MerchantTransactionsListDTO';
import { MerchantTransactionsProcessedListDTO } from '../../api/generated/merchants/MerchantTransactionsProcessedListDTO';
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

export const getMerchantTransactionsProcessed = (
  initiativeId: string,
  page: number,
  fiscalCode?: string,
  status?: string
): Promise<MerchantTransactionsProcessedListDTO> =>
  MerchantsApiMocked.getMerchantTransactionsProcessed(initiativeId, page, fiscalCode, status);

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
  idTrxAcquirer: string,
  initiativeId: string,
  mcc: string | undefined
): Promise<TransactionResponse> =>
  MerchantsApiMocked.createTransaction(amountCents, idTrxAcquirer, initiativeId, mcc);

// export const confirmPaymentQRCode = (transactionId: string) =>
//   MerchantsApiMocked.confirmPaymentQRCode(transactionId);

export const authPaymentBarCode = (
  trxCode: string,
  amountCents: number
): Promise<AuthPaymentResponseDTO> => MerchantsApiMocked.authPaymentBarCode(trxCode, amountCents);
