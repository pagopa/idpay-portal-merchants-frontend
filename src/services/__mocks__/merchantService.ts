import { MerchantsApiMocked } from '../../api/__mocks__/MerchantsApiClient';
import {
  InitiativeDTO,
  MerchantDetailDTO,
  MerchantStatisticsDTO,
  MerchantTransactionsListDTO,
  TransactionResponse,
} from '../../api/generated/merchants/data-contracts';

export const getMerchantInitiativeList = (): Promise<Array<InitiativeDTO>> =>
  MerchantsApiMocked.getMerchantInitiativeList();

export const getMerchantTransactions = (
  _initiativeId: string,
  _page: number,
  _fiscalCode?: string,
  _status?: string
): Promise<MerchantTransactionsListDTO> =>
  MerchantsApiMocked.getMerchantTransactions();

export const getMerchantTransactionsProcessed = (
  _initiativeId: string,
  _page: number,
  _fiscalCode?: string,
  _status?: string
): Promise<MerchantTransactionsListDTO> =>
  MerchantsApiMocked.getMerchantTransactions();

export const getMerchantInitiativeStatistics = (
  _initiativeId: string
): Promise<MerchantStatisticsDTO> =>
  MerchantsApiMocked.getMerchantInitiativeStatistics();

export const getMerchantDetail = (_initiativeId: string): Promise<MerchantDetailDTO> =>
  MerchantsApiMocked.getMerchantDetail();

export const deleteTransaction = (_transactionId: string): Promise<void> =>
  MerchantsApiMocked.deleteTransaction();

export const createTransaction = (
  _amountCents: number,
  _idTrxAcquirer: string,
  _initiativeId: string,
  _mcc: string | undefined
): Promise<TransactionResponse> =>
  MerchantsApiMocked.createTransaction();

export const authPaymentBarCode = (
  _trxCode: string,
  _amountCents: number,
  _idTrxAcquirer: string
): Promise<any> => MerchantsApiMocked.authPaymentBarCode();
