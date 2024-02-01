import { RolePermissionApiMocked } from '../../api/__mocks__/rolePermissionApiClient';
import { PortalConsentDTO } from '../../api/generated/role-permission/PortalConsentDTO';

export const mockedPermission = {
  role: 'admin',
  permissions: [
    {
      name: 'readIntitativeList',
      description: 'read initiatives list in homepage',
      mode: 'enabled',
    },
  ],
};

export const mockedPortalConsent = {};

export const getUserPermission = () => RolePermissionApiMocked.userPermission();
export const getPortalConsent = (): Promise<PortalConsentDTO> => RolePermissionApiMocked.getPortalConsent();
export const savePortalConsent = () => RolePermissionApiMocked.savePortalConsent();
