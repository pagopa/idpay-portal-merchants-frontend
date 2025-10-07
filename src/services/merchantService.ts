import { MerchantApi } from '../api/MerchantsApiClient';
import { InitiativeDTOArray } from '../api/generated/merchants/InitiativeDTOArray';
import { MerchantDetailDTO } from '../api/generated/merchants/MerchantDetailDTO';
import { MerchantStatisticsDTO } from '../api/generated/merchants/MerchantStatisticsDTO';
import { MerchantTransactionsListDTO } from '../api/generated/merchants/MerchantTransactionsListDTO';
import { MerchantTransactionsProcessedListDTO } from '../api/generated/merchants/MerchantTransactionsProcessedListDTO';
import { PointOfSaleDTO } from '../api/generated/merchants/PointOfSaleDTO';
import { TransactionResponse } from '../api/generated/merchants/TransactionResponse';
import { GetPointOfSalesFilters, GetPointOfSalesResponse, GetPointOfSaleTransactionsFilters } from '../types/types';
import { PointOfSaleTransactionsProcessedListDTO } from '../api/generated/merchants/PointOfSaleTransactionsProcessedListDTO';

export const getMerchantInitiativeList = (): Promise<InitiativeDTOArray> => MerchantApi.getMerchantInitiativeList();

export const getMerchantTransactions = (
  initiativeId: string,
  page: number,
  fiscalCode?: string,
  status?: string
): Promise<MerchantTransactionsListDTO> => MerchantApi.getMerchantTransactions(initiativeId, page, fiscalCode, status);

export const getMerchantTransactionsProcessed = (
  initiativeId: string,
  page: number,
  fiscalCode?: string,
  status?: string
): Promise<MerchantTransactionsProcessedListDTO> => MerchantApi.getMerchantTransactionsProcessed(initiativeId, page, fiscalCode, status);

export const getMerchantInitiativeStatistics = (
  initiativeId: string
): Promise<MerchantStatisticsDTO> => MerchantApi.getMerchantInitiativeStatistics(initiativeId);

export const getMerchantDetail = (initiativeId: string): Promise<MerchantDetailDTO> => MerchantApi.getMerchantDetail(initiativeId);

export const deleteTransaction = (transactionId: string): Promise<void> => MerchantApi.deleteTransaction(transactionId);

export const createTransaction = (
  amountCents: number,
  idTrxAcquirer: string,
  initiativeId: string,
  mcc: string | undefined
): Promise<TransactionResponse> => MerchantApi.createTransaction(amountCents, idTrxAcquirer, initiativeId, mcc);

export const authPaymentBarCode = (
  trxCode: string,
  amountCents: number,
  idTrxAcquirer: string
): Promise<any> => MerchantApi.authPaymentBarCode(trxCode, amountCents, idTrxAcquirer);

export const updateMerchantPointOfSales = (merchantId: string, pointOfSales: Array<PointOfSaleDTO>): Promise<any> => MerchantApi.updateMerchantPointOfSales(merchantId, pointOfSales);

export const getMerchantPointOfSales = (merchantId: string, filters: GetPointOfSalesFilters): Promise<GetPointOfSalesResponse> => MerchantApi.getMerchantPointOfSales(merchantId, filters);

export const getMerchantPointOfSalesById = (merchantId: string, pointOfSaleId: string): Promise<PointOfSaleDTO> => MerchantApi.getMerchantPointOfSalesById(merchantId, pointOfSaleId);

export const getMerchantPointOfSaleTransactionsProcessed = (initiativeId: string, pointOfSaleId: string, filters?: GetPointOfSaleTransactionsFilters): Promise<PointOfSaleTransactionsProcessedListDTO> => MerchantApi.getMerchantPointOfSaleTransactionsProcessed(initiativeId, pointOfSaleId, filters);

  
