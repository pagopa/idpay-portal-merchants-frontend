import {
  PortalConsentDTO,
  UserPermissionDTO,
} from '../api/generated/role-permission/data-contracts';
import { RolePermissionApi } from '../api/rolePermissionApiClient';

export const getUserPermission = (): Promise<UserPermissionDTO> =>
  RolePermissionApi.userPermission();

export const getPortalConsent = (): Promise<PortalConsentDTO> =>
  RolePermissionApi.getPortalConsent();

export const savePortalConsent = (
  versionId: string | undefined
): Promise<void> => RolePermissionApi.savePortalConsent(versionId);
