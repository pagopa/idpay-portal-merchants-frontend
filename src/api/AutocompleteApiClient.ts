import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import { buildFetchApi, extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/autocomplete/client';
import { AddressAutocompleteRequestDTO } from './generated/autocomplete/AddressAutocompleteRequestDTO';
import { AddressAutocompleteResponseDTO } from './generated/autocomplete/AddressAutocompleteResponseDTO';

const withBearer: WithDefaultsT<'Bearer'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    Bearer: `Bearer ${token}`,
  });
};
const apiClient = createClient({
  baseUrl: ENV.URL_API.MERCHANTS,
  basePath: '/address-search',
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
      displayableTitle: i18n.t('errors.sessionExpiredTitle'),
      displayableDescription: i18n.t('errors.sessionExpiredMessage'),
    })
  );

export const AutocompleteApi = {
  getAddresses: async (request: AddressAutocompleteRequestDTO): Promise<AddressAutocompleteResponseDTO> => {
    const result = await apiClient.autocomplete({ body: request });
    return extractResponse(result, 200, onRedirectToLogin);
  },
};