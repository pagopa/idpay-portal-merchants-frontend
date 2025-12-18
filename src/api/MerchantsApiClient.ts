import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import { buildFetchApi, extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
import { isRight } from 'fp-ts/Either';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import {
  GetPointOfSalesFilters,
  GetPointOfSalesResponse,
  GetPointOfSaleTransactionsFilters,
} from '../types/types';
import { createClient, WithDefaultsT } from './generated/merchants/client';
import { MerchantTransactionsListDTO } from './generated/merchants/MerchantTransactionsListDTO';
import { MerchantStatisticsDTO } from './generated/merchants/MerchantStatisticsDTO';
import { MerchantDetailDTO } from './generated/merchants/MerchantDetailDTO';
import { TransactionResponse } from './generated/merchants/TransactionResponse';
import { InitiativeDTOArray } from './generated/merchants/InitiativeDTOArray';
import { PointOfSaleDTO } from './generated/merchants/PointOfSaleDTO';
import { PointOfSaleTransactionsProcessedListDTO } from './generated/merchants/PointOfSaleTransactionsProcessedListDTO';
import { DownloadInvoiceResponseDTO } from './generated/merchants/DownloadInvoiceResponseDTO';
import { ReportedUserDTO } from './generated/merchants/ReportedUserDTO';
import { ReportedUserCreateResponseDTO } from './generated/merchants/ReportedUserCreateResponseDTO';
import { RewardBatchListDTO } from './generated/merchants/RewardBatchListDTO';
import { DownloadRewardBatchResponseDTO } from './generated/merchants/DownloadRewardBatchResponseDTO';

const withBearer: WithDefaultsT<'Bearer'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    Bearer: `Bearer ${token}`,
  });
};

const apiClient = createClient({
  baseUrl: ENV.URL_API.MERCHANTS_PORTAL,
  basePath: '',
  fetchApi: buildFetchApi(ENV.API_TIMEOUT_MS.MERCHANTS_PORTAL),
  withDefaults: withBearer,
});

const onRedirectToLogin = () => {
  store.dispatch(
    appStateActions.addError({
      id: 'tokenNotValid',
      error: new Error(),
      techDescription: 'token expired or not valid',
      toNotify: false,
      blocking: false,
      displayableTitle: i18n.t('errors.sessionExpiredTitle'),
      displayableDescription: i18n.t('errors.sessionExpiredMessage'),
    })
  );
};

export const MerchantApi = {
  getMerchantInitiativeList: async (): Promise<InitiativeDTOArray> => {
    const result = await apiClient.getMerchantInitiativeList({});
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getMerchantTransactions: async (
    initiativeId: string,
    page: number,
    fiscalCode?: string,
    status?: string
  ): Promise<MerchantTransactionsListDTO> => {
    const result = await apiClient.getMerchantTransactions({
      initiativeId,
      page,
      size: 10,
      fiscalCode,
      status,
    });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getMerchantTransactionsProcessed: async (
    params: {
      initiativeId: string;
      page?: number;
      size?: number;
      sort?: string;
      fiscalCode?: string;
      status?: string;
      rewardBatchId?: string;
      rewardBatchTrxStatus?: string;
      pointOfSaleId?: string;
    }
  ): Promise<MerchantTransactionsListDTO> => {
    const result = await apiClient.getMerchantTransactionsProcessed({
      ...params
    });
    console.log("[DEBUG] getMerchantTransactionsProcessed:", result);
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getMerchantInitiativeStatistics: async (initiativeId: string): Promise<MerchantStatisticsDTO> => {
    const result = await apiClient.getMerchantInitiativeStatistics({ initiativeId });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getMerchantDetail: async (initiativeId: string): Promise<MerchantDetailDTO> => {
    const result = await apiClient.getMerchantDetail({ initiativeId });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  deleteTransaction: async (transactionId: string): Promise<void> => {
    const result = await apiClient.deleteTransaction({ transactionId });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  createTransaction: async (
    amountCents: number,
    idTrxAcquirer: string,
    initiativeId: string,
    mcc: string | undefined
  ): Promise<TransactionResponse> => {
    const body = { body: { amountCents, idTrxAcquirer, initiativeId, mcc } };
    const result = await apiClient.createTransaction(body);
    return extractResponse(result, 201, onRedirectToLogin);
  },

  authPaymentBarCode: async (
    trxCode: string,
    amountCents: number,
    idTrxAcquirer: string
  ): Promise<any> => {
    const result = await apiClient.authPaymentBarCode({ trxCode, body: {  amountCents, idTrxAcquirer  } });
     return extractResponse(result, 200, onRedirectToLogin);
  },
  updateMerchantPointOfSales: async (
    merchantId: string,
    pointOfSales: Array<PointOfSaleDTO>
  ): Promise<{ code: string; message: string }> => {
    const result = await apiClient.putPointOfSales({ merchantId, body: pointOfSales } as any);
    if (!isRight(result)) {
      return {
        code: (result.left as any)?.at?.(0)?.value ?? (result.left as any)?.at?.(0)?.actual,
        message: (result.left as any)?.at?.(0)?.context[1]?.actual?.message,
      };
    } else {
      return extractResponse(result, 204, onRedirectToLogin);
    }
  },

  getMerchantPointOfSales: async (
    merchantId: string,
    filters: GetPointOfSalesFilters
  ): Promise<GetPointOfSalesResponse> => {
    const result = await apiClient.getPointOfSales({ merchantId, ...filters });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getMerchantPointOfSalesById: async (
    merchantId: string,
    pointOfSaleId: string
  ): Promise<PointOfSaleDTO> => {
    const result = await apiClient.getPointOfSale({ merchantId, pointOfSaleId });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getMerchantPointOfSaleTransactionsProcessed: async (
    initiativeId: string,
    pointOfSaleId: string,
    filters?: GetPointOfSaleTransactionsFilters
  ): Promise<PointOfSaleTransactionsProcessedListDTO> => {
    const result = await apiClient.getPointOfSaleTransactionsProcessed({
      initiativeId,
      pointOfSaleId,
      ...filters,
    });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  downloadInvoiceFile: async (
    transactionId: string,
    pointOfSaleId: string
  ): Promise<DownloadInvoiceResponseDTO> => {
    const result = await apiClient.downloadInvoiceFile({ transactionId, pointOfSaleId });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getReportedUser: async (
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserDTO> => {
    const result = await apiClient.getReportedUser({
      'initiative-id': initiativeId,
      userFiscalCode,
    });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  createReportedUser: async (
    initiativeId: string,
    fiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> => {
    const token = storageTokenOps.read();
    const response = await fetch(`${ENV.URL_API.MERCHANTS_PORTAL}/reported-user/${fiscalCode}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'initiative-id': initiativeId,
        'Content-Type': 'text/plain',
      },
    });
    return await response.json();
  },

  deleteReportedUser: async (
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> => {
    const result = await apiClient.deleteReportedUser({
      'initiative-id': initiativeId,
      userFiscalCode,
    });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getRewardBatches: async (
    initiativeId: string
  ): Promise<RewardBatchListDTO> => {
     try {
    const result = await apiClient.getRewardBatches({
      initiativeId
    });

    return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error, "userPermission");
      return {} as RewardBatchListDTO;
    }
  },

  getAllRewardBatches: async (
    initiativeId: string
  ): Promise<RewardBatchListDTO> => {
    try {
      const result = await apiClient.getRewardBatches({
        initiativeId,
        size: 1000
      });

      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error, "userPermission");
      return {} as RewardBatchListDTO;
    }
  },

  sendRewardBatches: async (
    initiativeId: string,
    batchId: string
  ): Promise<any> => {

    const result: any = await apiClient.sendRewardBatches({
      initiativeId,
      batchId
    });

    if(result?.right?.value?.code === "REWARD_BATCH_PREVIOUS_NOT_SENT"){
      return extractResponse(result, 400, onRedirectToLogin);
    }

    return extractResponse(result, 204, onRedirectToLogin);
  },

  postponeTransaction: async (
    initiativeId: string,
    rewardBatchId: string,
    transactionId: string,
    initiativeEndDate: string
  ): Promise<void> => {
    const result = await apiClient.postponeTransaction({
      initiativeId,
      rewardBatchId,
      transactionId,
      initiativeEndDate
    });
    return extractResponse(result, 204, onRedirectToLogin);
  },



  downloadBatchCsv: async (
    initiativeId: string,
    rewardBatchId: string
  ): Promise<DownloadRewardBatchResponseDTO> => {
    const result = await apiClient.approveDownloadRewardBatch({
      initiativeId,
      rewardBatchId
    });

    return extractResponse(result, 200, onRedirectToLogin);
  },
  
};



function logApiError(error: any, apiName?: string) {
 
  const errorKey = error?.response?.data?.errorKey;
  if (errorKey) {
    console.error(`Error Key: ${errorKey}`);
  }
  const pretty = (val: any) =>
    typeof val === "string"
      ? val
      : val !== undefined
        ? JSON.stringify(val, null, 2)
        : "N/A";
  const apiLabel = apiName ? `[API ERROR] MerchantsApi.${apiName}` : "[API ERROR] MerchantsApi";
  if (console.groupCollapsed) {
    console.groupCollapsed(apiLabel);
  } else {
    console.error(apiLabel);
  }
  console.error("Message:", pretty(error?.message));
  console.error("Error name:", error?.name ?? "N/A");
  console.error("Stack:", pretty(error?.stack));
  console.error("Full error object:", pretty(error));
  if (console.groupEnd) {
    console.groupEnd();
  }
}
