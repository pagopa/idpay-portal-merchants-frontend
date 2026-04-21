import {
  mockedPermission,
  mockedPortalConsent,
} from '../../services/__mocks__/rolePermissionService';
import { PortalConsentDTO, UserPermissionDTO } from '../generated/role-permission/data-contracts';

export const RolePermissionApiMocked = {
  userPermission: async (): Promise<UserPermissionDTO> =>
    new Promise((resolve) => resolve(mockedPermission)),
  getPortalConsent: async (): Promise<PortalConsentDTO> =>
    new Promise((resolve) => resolve(mockedPortalConsent)),
  savePortalConsent: async (): Promise<void> => new Promise((resolve) => resolve()),
};
