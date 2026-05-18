import { getMerchantsApi } from '../api/MerchantsApiClient';
import {
  InitiativeDTO,
  MerchantStatisticsDTO,
  MerchantDetailDTO,
  MerchantTransactionsListDTO,
  PointOfSaleTransactionsProcessedListDTO,
  DownloadInvoiceResponseDTO,
  ReportedUserDTO,
  ReportedUserCreateResponseDTO,
  RewardBatchListDTO,
  DownloadRewardBatchResponseDTO,
  FranchisePointOfSaleDTO,
  ReportListDTO,
  ReportRequest,
  RewardBatchDTO,
  TransactionResponse,
} from '../api/generated/merchants/data-contracts';
import { GetPointOfSalesFilters, GetPointOfSaleTransactionsFilters } from '../types/types';

export type GetMerchantTransactionsProcessedParams = {
  initiativeId: string;
  page?: number;
  size?: number;
  sort?: string;
  fiscalCode?: string;
  status?: string;
  rewardBatchId?: string;
  rewardBatchTrxStatus?: string;
  pointOfSaleId?: string;
  trxCode?: string;
};

export const getMerchantInitiativeList = (): Promise<Array<InitiativeDTO>> =>
  getMerchantsApi().getMerchantInitiativeList();

export const getMerchantTransactions = (
  initiativeId: string,
  page: number,
  fiscalCode?: string,
  status?: string
): Promise<MerchantTransactionsListDTO> =>
  getMerchantsApi().getMerchantTransactions(initiativeId, page, fiscalCode, status);

export const getMerchantTransactionsProcessed = (
  params: GetMerchantTransactionsProcessedParams
): Promise<MerchantTransactionsListDTO> => {
  const { initiativeId, ...query } = params;

  return getMerchantsApi().getMerchantTransactionsProcessed(initiativeId, query);
};

export const getMerchantInitiativeStatistics = (
  initiativeId: string
): Promise<MerchantStatisticsDTO> =>
  getMerchantsApi().getMerchantInitiativeStatistics(initiativeId);

export const getMerchantDetail = (initiativeId: string): Promise<MerchantDetailDTO> =>
  getMerchantsApi().getMerchantDetail(initiativeId);

export const deleteTransaction = (transactionId: string): Promise<void> =>
  getMerchantsApi().deleteTransaction(transactionId);

export const reversalTransactionInvoiced = (
  transactionId: string,
  file: File,
  docNumber?: string
): Promise<void | { code: string; message: string }> =>
  getMerchantsApi().reversalTransactionInvoiced(transactionId, file, docNumber);

export const createTransaction = (
  amountCents: number,
  idTrxAcquirer: string,
  initiativeId: string,
  mcc?: string
): Promise<TransactionResponse> =>
  getMerchantsApi().createTransaction({
    amountCents,
    idTrxAcquirer,
    initiativeId,
    mcc,
  });

export const authPaymentBarCode = (
  trxCode: string,
  amountCents: number,
  idTrxAcquirer: string
): Promise<unknown> =>
  getMerchantsApi().authPaymentBarCode(trxCode, {
    amountCents,
    idTrxAcquirer,
  });

export const updateMerchantPointOfSales = async (
  merchantId: string,
  pointOfSales: Array<import('../api/generated/merchants/data-contracts').PointOfSaleDTO>
): Promise<void | { code?: string; message?: string }> => {
  const result = await getMerchantsApi().updateMerchantPointOfSales(merchantId, pointOfSales);

  return result as void | { code?: string; message?: string };
};

export const getMerchantPointOfSales = async (
  merchantId: string,
  _filters: GetPointOfSalesFilters
): Promise<{
  content: Array<import('../api/generated/merchants/data-contracts').PointOfSaleDTO>;
  pageNo: number;
  pageSize: number;
  totalElements: number;
}> => {
  const response = await getMerchantsApi().getMerchantPointOfSales(merchantId);

  return {
    content: (response as any)?.content ?? [],
    pageNo: (response as any)?.pageNumber ?? 0,
    pageSize: (response as any)?.pageSize ?? 0,
    totalElements: (response as any)?.totalElements ?? 0,
  };
};

export const getMerchantPointOfSalesWithTransactions = (
  rewardBatchId: string
): Promise<Array<FranchisePointOfSaleDTO>> =>
  getMerchantsApi().downloadApprovedRewardBatch(
    rewardBatchId,
    rewardBatchId
  ) as unknown as Promise<Array<FranchisePointOfSaleDTO>>;

export const getMerchantPointOfSalesById = (merchantId: string, pointOfSaleId: string) =>
  getMerchantsApi().getMerchantPointOfSalesById(merchantId, pointOfSaleId);

export const getMerchantPointOfSaleTransactionsProcessed = (
  initiativeId: string,
  pointOfSaleId: string,
  filters?: GetPointOfSaleTransactionsFilters
): Promise<PointOfSaleTransactionsProcessedListDTO> =>
  getMerchantsApi().getMerchantPointOfSaleTransactionsProcessed(
    initiativeId,
    pointOfSaleId,
    filters as unknown as Record<string, unknown> | undefined
  );

export const downloadInvoiceFile = (
  transactionId: string,
  pointOfSaleId: string
): Promise<DownloadInvoiceResponseDTO> =>
  getMerchantsApi().downloadInvoiceFile(pointOfSaleId, transactionId);

export const getReportedUser = (
  initiativeId: string,
  userFiscalCode: string
): Promise<Array<ReportedUserDTO>> =>
  getMerchantsApi().getReportedUser(initiativeId, userFiscalCode);

export const createReportedUser = (
  initiativeId: string,
  fiscalCode: string
): Promise<ReportedUserCreateResponseDTO> =>
  getMerchantsApi().createReportedUser(initiativeId, fiscalCode);

export const deleteReportedUser = (
  initiativeId: string,
  userFiscalCode: string
): Promise<ReportedUserCreateResponseDTO> =>
  getMerchantsApi().deleteReportedUser(initiativeId, userFiscalCode);

export const getRewardBatches = (
  initiativeId: string,
  page: number,
  size: number
): Promise<RewardBatchListDTO> => getMerchantsApi().getRewardBatches(initiativeId, page, size);

export const getAllRewardBatches = (initiativeId: string): Promise<RewardBatchListDTO> =>
  getMerchantsApi().getAllRewardBatches(initiativeId);

export const getRewardBatchById = (
  initiativeId: string,
  rewardBatchId: string
): Promise<RewardBatchDTO> => getMerchantsApi().getRewardBatchById(initiativeId, rewardBatchId);

export const sendRewardBatch = (initiativeId: string, batchId: string): Promise<void> =>
  getMerchantsApi().sendRewardBatch(initiativeId, batchId);

export const downloadBatchCsv = (
  initiativeId: string,
  rewardBatchId: string
): Promise<DownloadRewardBatchResponseDTO> =>
  getMerchantsApi().downloadBatchCsv(initiativeId, rewardBatchId);

export const postponeTransaction = (
  initiativeId: string,
  rewardBatchId: string,
  transactionId: string
): Promise<void> =>
  getMerchantsApi().postponeTransaction(initiativeId, rewardBatchId, transactionId);

export const getMerchantReports = (
  _initiativeId: string,
  _page?: number,
  _size?: number
): Promise<ReportListDTO> =>
  getMerchantsApi().getMerchantReports() as Promise<ReportListDTO>;

export const generateMerchantReport = (
  _initiativeId: string,
  _body: ReportRequest
): Promise<void> =>
  getMerchantsApi().generateMerchantReport();

export const downloadMerchantReport = (
  _initiativeId: string,
  _reportId: string
) => getMerchantsApi().downloadMerchantReport();

export const updateInvoiceTransaction = (
  transactionId: string,
  file: File,
  docNumber?: string
): Promise<{ code: string; message: string } | void> =>
  getMerchantsApi().updateInvoiceTransaction(transactionId, file, docNumber);
