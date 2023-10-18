import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import { buildFetchApi, extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/merchants/client';
import { MerchantTransactionsListDTO } from './generated/merchants/MerchantTransactionsListDTO';
import { MerchantStatisticsDTO } from './generated/merchants/MerchantStatisticsDTO';
import { MerchantDetailDTO } from './generated/merchants/MerchantDetailDTO';
import { TransactionResponse } from './generated/merchants/TransactionResponse';
import { InitiativeDTOArray } from './generated/merchants/InitiativeDTOArray';
import { MerchantTransactionsProcessedListDTO } from './generated/merchants/MerchantTransactionsProcessedListDTO';
import { AuthPaymentResponseDTO } from './generated/merchants/AuthPaymentResponseDTO';

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

const onRedirectToLogin = () =>
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
    initiativeId: string,
    page: number,
    fiscalCode?: string,
    status?: string
  ): Promise<MerchantTransactionsProcessedListDTO> => {
    const result = await apiClient.getMerchantTransactionsProcessed({
      initiativeId,
      page,
      size: 10,
      fiscalCode,
      status,
    });
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
    amountCents: number
  ): Promise<AuthPaymentResponseDTO> => {
    const result = await apiClient.authPaymentBarCode({ trxCode, body: { amountCents } });
    return extractResponse(result, 200, onRedirectToLogin);
  },
};
