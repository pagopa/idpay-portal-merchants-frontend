import { PortalConsentDTO } from '../api/generated/role-permission/PortalConsentDTO';
import { UserPermissionDTO } from '../api/generated/role-permission/UserPermissionDTO';
import { RolePermissionApi } from '../api/rolePermissionApiClient';
import { RolePermissionApiMocked } from '../api/__mocks__/rolePermissionApiClient';

export const getUserPermission = (): Promise<UserPermissionDTO> => {
  if (process.env.REACT_APP_API_MOCK_ROLE_PERMISSION === 'true') {
    return RolePermissionApiMocked.userPermission();
  }
  return RolePermissionApi.userPermission();
};

export const getPortalConsent = (): Promise<PortalConsentDTO> => {
  if (process.env.REACT_APP_API_MOCK_ROLE_PERMISSION === 'true') {
    return RolePermissionApiMocked.getPortalConsent();
  }
  return RolePermissionApi.getPortalConsent();
};

export const savePortalConsent = (versionId: string | undefined): Promise<void> => {
  if (process.env.REACT_APP_API_MOCK_ROLE_PERMISSION === 'true') {
    return RolePermissionApiMocked.savePortalConsent();
  } else {
    return RolePermissionApi.savePortalConsent(versionId);
  }
};
