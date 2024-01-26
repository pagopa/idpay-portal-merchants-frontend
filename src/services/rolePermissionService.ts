import { PortalConsentDTO } from '../api/generated/role-permission/PortalConsentDTO';
import { UserPermissionDTO } from '../api/generated/role-permission/UserPermissionDTO';
import { RolePermissionApi } from '../api/rolePermissionApiClient';
// import { RolePermissionApiMocked } from '../api/__mocks__/rolePermissionApiClient';

export const getUserPermission = (): Promise<UserPermissionDTO> => RolePermissionApi.userPermission();

export const getPortalConsent = (): Promise<PortalConsentDTO> => RolePermissionApi.getPortalConsent();


export const savePortalConsent = (versionId: string | undefined): Promise<void> => RolePermissionApi.savePortalConsent(versionId);

