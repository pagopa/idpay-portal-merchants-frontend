import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import { buildFetchApi, extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import i18n from '@pagopa/selfcare-common-frontend/locale/locale-utils';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/role-permission/client';
import { UserPermissionDTO } from './generated/role-permission/UserPermissionDTO';
import { PortalConsentDTO } from './generated/role-permission/PortalConsentDTO';

const withBearerAndPartyId: WithDefaultsT<'Bearer'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    Bearer: `Bearer ${token}`,
  });
};

const rolePermissionClient = createClient({
  baseUrl: ENV.URL_API.ROLE_PERMISSION,
  basePath: '',
  fetchApi: buildFetchApi(ENV.API_TIMEOUT_MS.ROLE_PERMISSION),
  withDefaults: withBearerAndPartyId,
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

export const RolePermissionApi = {
  userPermission: async (): Promise<UserPermissionDTO> => {
    const result = await rolePermissionClient.userPermission({});
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getPortalConsent: async (): Promise<PortalConsentDTO> => {
    const result = await rolePermissionClient.getPortalConsent({});
    return extractResponse(result, 200, onRedirectToLogin);
  },

  savePortalConsent: async (versionId: string | undefined): Promise<void> => {
    const result = await rolePermissionClient.savePortalConsent({ body: { versionId } });
    return extractResponse(result, 200, onRedirectToLogin);
  },
};
