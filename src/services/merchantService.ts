import { getMerchantsApi, TransactionMutationResponse } from '../api/MerchantsApiClient';
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
  PointOfSaleExclusionResultDTO,
} from '../api/generated/merchants/data-contracts';
import { GetPointOfSalesFilters, GetPointOfSaleTransactionsFilters } from '../types/types';
import {
  describeError,
  logTrxBridge,
  nextTrxBridgeCorrelationId,
} from '../utils/transactionBridgeLogger';
import {
  getPendingTransactionStatesSnapshot,
  peekPendingTransactionState,
  reconcileProcessedTransactions,
  recordPendingTransactionState,
} from './transactionStateBridge';

type GetPointOfSalesCatalogFilters = Omit<GetPointOfSalesFilters, 'initiative'> & {
  initiativeId?: string;
  initiativeFilter?: 'ALL_INITIATIVES' | 'NO_INITIATIVE';
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
  /** Client-only: month ("YYYY-MM") of the reward batch filter, used by the state bridge. */
  batchMonth?: string;
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

// Diagnostics: detects overlapping/out-of-order processed-list responses.
let latestProcessedListRequestSeq = 0;
let processedListRequestsInFlight = 0;

export const getMerchantTransactionsProcessed = async (
  params: GetMerchantTransactionsProcessedParams
): Promise<MerchantTransactionsListDTO> => {
  const { initiativeId, batchMonth, ...query } = params;

  latestProcessedListRequestSeq += 1;
  const requestSeq = latestProcessedListRequestSeq;
  const correlationId = nextTrxBridgeCorrelationId('list');
  const startedAt = Date.now();
  processedListRequestsInFlight += 1;

  const { fiscalCode, ...loggableQuery } = query;
  logTrxBridge('debug', 'list.request-start', {
    correlationId,
    requestSeq,
    initiativeId,
    query: { ...loggableQuery, hasFiscalCode: Boolean(fiscalCode) },
    batchMonth,
    inFlight: processedListRequestsInFlight,
    pending: getPendingTransactionStatesSnapshot(initiativeId, startedAt),
  });

  try {
    const response = await getMerchantsApi().getMerchantTransactionsProcessed(initiativeId, query);
    const receivedAt = Date.now();

    logTrxBridge(
      requestSeq === latestProcessedListRequestSeq ? 'debug' : 'warn',
      'list.response-received',
      {
        correlationId,
        requestSeq,
        latestRequestSeq: latestProcessedListRequestSeq,
        supersededByNewerRequest: requestSeq !== latestProcessedListRequestSeq,
        durationMs: receivedAt - startedAt,
        inFlight: processedListRequestsInFlight,
      }
    );

    return reconcileProcessedTransactions(initiativeId, response, receivedAt, correlationId, {
      batchMonth,
    });
  } catch (error) {
    logTrxBridge('error', 'list.request-failed', {
      correlationId,
      requestSeq,
      durationMs: Date.now() - startedAt,
      ...describeError(error),
    });
    throw error;
  } finally {
    processedListRequestsInFlight -= 1;
  }
};

export const getMerchantInitiativeStatistics = (
  initiativeId: string
): Promise<MerchantStatisticsDTO> =>
  getMerchantsApi().getMerchantInitiativeStatistics(initiativeId);

export const getMerchantDetail = (initiativeId: string): Promise<MerchantDetailDTO> =>
  getMerchantsApi().getMerchantDetail(initiativeId);

export const deleteTransaction = (initaitiveId: string, transactionId: string): Promise<void> =>
  getMerchantsApi().deleteTransaction(initaitiveId, transactionId);

// Diagnostics: tracks concurrent mutations on the same transaction (e.g. double submit).
const mutationsInFlightByTrx: Record<string, number> = {};

const runLoggedTransactionMutation = async (
  operation: 'reversal' | 'invoice-update',
  initiativeId: string,
  transactionId: string,
  file: File,
  docNumber: string | undefined,
  call: () => Promise<TransactionMutationResponse>
): Promise<{ response: TransactionMutationResponse; correlationId: string }> => {
  const correlationId = nextTrxBridgeCorrelationId(operation);
  const trxKey = `${initiativeId}:${transactionId}`;
  const startedAt = Date.now();
  const concurrent = mutationsInFlightByTrx[trxKey] ?? 0;
  // eslint-disable-next-line functional/immutable-data
  mutationsInFlightByTrx[trxKey] = concurrent + 1;

  logTrxBridge(concurrent > 0 ? 'warn' : 'info', 'mutation.start', {
    correlationId,
    operation,
    initiativeId,
    trxId: transactionId,
    concurrentMutationsOnSameTrx: concurrent,
    hasDocNumber: Boolean(docNumber),
    fileSize: file?.size,
    fileType: file?.type,
    pendingBefore: peekPendingTransactionState(initiativeId, transactionId) ?? null,
  });

  try {
    const response = await call();
    logTrxBridge(
      response?.transactionRevision === undefined ? 'warn' : 'info',
      'mutation.succeeded',
      {
        correlationId,
        operation,
        trxId: transactionId,
        durationMs: Date.now() - startedAt,
        transactionRevision: response?.transactionRevision,
        willRecordPending: response?.transactionRevision !== undefined,
      }
    );
    return { response, correlationId };
  } catch (error) {
    logTrxBridge('error', 'mutation.failed', {
      correlationId,
      operation,
      trxId: transactionId,
      durationMs: Date.now() - startedAt,
      pendingAtFailure: peekPendingTransactionState(initiativeId, transactionId) ?? null,
      ...describeError(error),
    });
    throw error;
  } finally {
    // eslint-disable-next-line functional/immutable-data
    mutationsInFlightByTrx[trxKey] = Math.max(0, (mutationsInFlightByTrx[trxKey] ?? 1) - 1);
  }
};

export const reversalTransactionInvoiced = async (
  initiativeId: string,
  transactionId: string,
  file: File,
  docNumber?: string
): Promise<void | { code: string; message: string }> => {
  const { response, correlationId } = await runLoggedTransactionMutation(
    'reversal',
    initiativeId,
    transactionId,
    file,
    docNumber,
    () =>
      getMerchantsApi().reversalTransactionInvoiced(initiativeId, transactionId, file, docNumber)
  );

  if (response?.transactionRevision !== undefined) {
    recordPendingTransactionState({
      initiativeId,
      transactionId,
      operation: 'reversal',
      effect: 'reversal',
      expectedTransactionRevision: response.transactionRevision,
      correlationId,
    });
  }
};

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
  initiativeId: string,
  trxCode: string,
  amountCents: number,
  idTrxAcquirer: string
): Promise<unknown> =>
  getMerchantsApi().authPaymentBarCode(initiativeId, trxCode, {
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

export const excludePos = (
  initiativeId: string,
  merchantId: string,
  pointOfSaleIds: Array<string>
): Promise<PointOfSaleExclusionResultDTO> =>
  getMerchantsApi().excludePos(initiativeId, merchantId, pointOfSaleIds);

export const getMerchantPointOfSaleTransactionsProcessed = async (
  initiativeId: string,
  pointOfSaleId: string,
  filters?: GetPointOfSaleTransactionsFilters
): Promise<PointOfSaleTransactionsProcessedListDTO> => {
  const response = await getMerchantsApi().getMerchantPointOfSaleTransactionsProcessed(
    initiativeId,
    pointOfSaleId,
    filters as unknown as Record<string, unknown> | undefined
  );

  // Diagnostics only: this list is NOT reconciled by the state bridge.
  const unbridgedRows = (response?.content ?? []).flatMap((row) => {
    const pending = row?.id ? peekPendingTransactionState(initiativeId, row.id) : undefined;
    return pending
      ? [
          {
            trxId: row.id,
            rowStatus: row.status,
            operation: pending.operation,
            expectedRevision: pending.expectedRevision,
            ageMs: pending.ageMs,
          },
        ]
      : [];
  });

  if (unbridgedRows.length > 0) {
    logTrxBridge('warn', 'pos-list.pending-rows-shown-unmasked', {
      initiativeId,
      pointOfSaleId,
      rows: unbridgedRows,
    });
  }

  return response;
};

export const downloadInvoiceFile = (
  initiativeId: string,
  transactionId: string,
  pointOfSaleId: string
): Promise<DownloadInvoiceResponseDTO> =>
  getMerchantsApi().downloadInvoiceFile(initiativeId, pointOfSaleId, transactionId);

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

export const updateInvoiceTransaction = async (
  initiativeId: string,
  transactionId: string,
  file: File,
  docNumber?: string
): Promise<{ code: string; message: string } | void> => {
  const { response, correlationId } = await runLoggedTransactionMutation(
    'invoice-update',
    initiativeId,
    transactionId,
    file,
    docNumber,
    () => getMerchantsApi().updateInvoiceTransaction(initiativeId, transactionId, file, docNumber)
  );

  if (response?.transactionRevision !== undefined) {
    recordPendingTransactionState({
      initiativeId,
      transactionId,
      operation: 'invoice-update',
      effect: 'invoice',
      expectedTransactionRevision: response.transactionRevision,
      invoice: {
        ...(docNumber !== undefined ? { docNumber } : {}),
        ...(file?.name ? { filename: file.name } : {}),
      },
      correlationId,
    });
  }
};

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
