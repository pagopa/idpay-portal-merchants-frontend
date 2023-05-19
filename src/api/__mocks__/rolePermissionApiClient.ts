import {
  mockedPermission,
  mockedPortalConsent,
} from '../../services/__mocks__/rolePermissionService';
import { PortalConsentDTO } from '../generated/role-permission/PortalConsentDTO';
import { UserPermissionDTO } from '../generated/role-permission/UserPermissionDTO';

export const RolePermissionApiMocked = {
  userPermission: async (): Promise<UserPermissionDTO> =>
    new Promise((resolve) => resolve(mockedPermission)),
  getPortalConsent: async (): Promise<PortalConsentDTO> =>
    new Promise((resolve) => resolve(mockedPortalConsent)),
  savePortalConsent: async (): Promise<void> => new Promise((resolve) => resolve()),
};
