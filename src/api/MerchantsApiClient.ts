import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import { buildFetchApi, extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/merchants/client';
import { TransactionCreationRequest } from './generated/merchants/TransactionCreationRequest';
import { TransactionResponse } from './generated/merchants/TransactionResponse';
import { SyncTrxStatus } from './generated/merchants/SyncTrxStatus';

const withBearer: WithDefaultsT<any> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    Bearer: `Bearer ${token}`,
  });
};

const apiClient = createClient({
  baseUrl: ENV.URL_API.MERCHANTS,
  basePath: '',
  fetchApi: buildFetchApi(ENV.API_TIMEOUT_MS.MERCHANTS),
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
      displayableTitle: i18n.t('session.expired.title'),
      displayableDescription: i18n.t('session.expired.message'),
    })
  );

export const MerchantApi = {
  createTransaction: async (
    merchantId: string,
    trx: TransactionCreationRequest
  ): Promise<TransactionResponse> => {
    const result = await apiClient.createTransaction({ 'x-merchant-id': merchantId, body: trx });
    return extractResponse(result, 201, onRedirectToLogin);
  },

  getStatusTransaction: async (
    merchantId: string,
    transactionId: string
  ): Promise<SyncTrxStatus> => {
    const result = await apiClient.getStatusTransaction({
      'x-merchant-id': merchantId,
      transactionId,
    });
    return extractResponse(result, 200, onRedirectToLogin);
  },

  confirmPaymentQRCode: async (
    merchantId: string,
    transactionId: string
  ): Promise<TransactionResponse> => {
    const result = await apiClient.confirmPaymentQRCode({
      'x-merchant-id': merchantId,
      transactionId,
    });
    return extractResponse(result, 200, onRedirectToLogin);
  },
};
