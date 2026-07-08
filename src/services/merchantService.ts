import { getMerchantsApi } from '../api/MerchantsApiClient';
import { ApiError } from '../api/ApiError';
import {
  GetMerchantInitiativesAvailableParams,
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
  ReportDTO,
  MerchantIbanPatchDTO,
  PointOfSaleDTO,
  PointOfSaleReferentPatchDTO,
  ValidationErrorDTO,
  PointOfSaleErrorDTO,
  ValidationErrorDetail,
  PointOfSaleInitiativeDTO,
  PointOfSaleOnboardingResultDTO,
  OnboardingResponse,
  PageResponseInitiativeResponse,
} from '../api/generated/merchants/data-contracts';
import { GetPointOfSalesFilters, GetPointOfSaleTransactionsFilters } from '../types/types';

type GetPointOfSalesCatalogFilters = Omit<GetPointOfSalesFilters, 'initiative'> & {
  initiativeId?: string;
};

const normalizePointOfSaleError = (
  errorData?: ValidationErrorDTO | PointOfSaleErrorDTO
): ValidationErrorDTO | PointOfSaleErrorDTO | undefined => {
  if (!errorData) {
    return undefined;
  }

  if (String(errorData.code) === 'VALIDATION_ERROR') {
    const validationErrorData = errorData as ValidationErrorDTO & {
      details?: Array<ValidationErrorDetail>;
    };

    return {
      ...validationErrorData,
      errors: validationErrorData.errors ?? validationErrorData.details ?? [],
    };
  }

  return errorData;
};

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

export const getMerchantInitiativesAvailable = (
  query?: GetMerchantInitiativesAvailableParams
): Promise<Array<PageResponseInitiativeResponse>> =>
  getMerchantsApi().getMerchantInitiativesAvailable(query);

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
  initiativeId: string,
  merchantId: string,
  pointOfSales: Array<PointOfSaleDTO>
): Promise<void | ValidationErrorDTO | PointOfSaleErrorDTO> => {
  try {
    const result = await getMerchantsApi().updateMerchantPointOfSales(
      initiativeId,
      merchantId,
      pointOfSales
    );

    return result as void | ValidationErrorDTO | PointOfSaleErrorDTO;
  } catch (error) {
    if (error instanceof ApiError) {
      const errorDetails = error.details as ValidationErrorDTO | PointOfSaleErrorDTO | undefined;

      if (errorDetails?.code) {
        return normalizePointOfSaleError({
          ...errorDetails,
          message: errorDetails.message ?? error.message ?? '',
        } as ValidationErrorDTO | PointOfSaleErrorDTO);
      }

      return {
        code: (error.code ?? 'POINT_OF_SALE_GENERIC_ERROR') as PointOfSaleErrorDTO['code'],
        message: error.message ?? '',
      };
    }

    const apiErrorData = (
      error as {
        response?: { data?: ValidationErrorDTO | PointOfSaleErrorDTO };
      }
    )?.response?.data;

    if (apiErrorData) {
      return normalizePointOfSaleError(apiErrorData);
    }

    return { code: 'POINT_OF_SALE_GENERIC_ERROR', message: '' };
  }
};

export const getMerchantPointOfSales = async (
  initiativeId: string,
  merchantId: string,
  filters: GetPointOfSalesFilters
): Promise<{
  content: Array<PointOfSaleDTO>;
  pageNo: number;
  pageSize: number;
  totalElements: number;
}> => {
  const response = await getMerchantsApi().getMerchantPointOfSales(
    initiativeId,
    merchantId,
    filters as unknown as Record<string, unknown>
  );

  return {
    content: (response as any)?.content ?? [],
    pageNo: (response as any)?.pageNumber ?? 0,
    pageSize: (response as any)?.pageSize ?? 0,
    totalElements: (response as any)?.totalElements ?? 0,
  };
};

export const getMerchantPointOfSalesCatalog = async (
  merchantId: string,
  filters: GetPointOfSalesCatalogFilters
): Promise<{
  content: Array<PointOfSaleDTO>;
  pageNo: number;
  pageSize: number;
  totalElements: number;
}> => {
  const response = await getMerchantsApi().getMerchantPointOfSalesCatalog(
    merchantId,
    filters as unknown as Record<string, unknown>
  );

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
  getMerchantsApi().getMerchantPointOfSalesWithTransactions(rewardBatchId);

export const getMerchantPointOfSalesById = (
  initiativeId: string,
  merchantId: string,
  pointOfSaleId: string
) => getMerchantsApi().getMerchantPointOfSalesById(initiativeId, merchantId, pointOfSaleId);

export const getPointOfSaleInitiatives = (
  merchantId: string,
  pointOfSaleId: string
): Promise<Array<PointOfSaleInitiativeDTO>> =>
  getMerchantsApi().getPointOfSaleInitiatives(merchantId, pointOfSaleId);

export const associatePos = (
  initiativeId: string,
  merchantId: string,
  pointOfSaleIds: Array<string>
): Promise<PointOfSaleOnboardingResultDTO> =>
  getMerchantsApi().associatePos(initiativeId, merchantId, pointOfSaleIds);

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
  initiativeId: string,
  page?: number,
  size?: number
): Promise<ReportListDTO> => getMerchantsApi().getMerchantReports(initiativeId, page, size);

export const generateMerchantReport = (
  initiativeId: string,
  body: ReportRequest
): Promise<ReportDTO> => getMerchantsApi().generateMerchantReport(initiativeId, body);

export const downloadMerchantReport = (initiativeId: string, reportId: string) =>
  getMerchantsApi().downloadMerchantReport(initiativeId, reportId);

export const updateInvoiceTransaction = (
  transactionId: string,
  file: File,
  docNumber?: string
): Promise<{ code: string; message: string } | void> =>
  getMerchantsApi().updateInvoiceTransaction(transactionId, file, docNumber);

export const updateMerchantData = (
  initaitiveId: string,
  merchantData: MerchantIbanPatchDTO
): Promise<void> => getMerchantsApi().updateMerchantData(initaitiveId, merchantData);

export const patchPointOfSaleReferent = (
  merchantId: string,
  pointOfSaleId: string,
  body: PointOfSaleReferentPatchDTO
): Promise<PointOfSaleDTO> =>
  getMerchantsApi().patchPointOfSaleReferent(merchantId, pointOfSaleId, body);

export const putMerchantOnboardingRequest = (initiativeId: string): Promise<OnboardingResponse> =>
  getMerchantsApi().putMerchantOnboardingRequest(initiativeId);

