import { ENV } from '../utils/env';
import {
  PortalConsentDTO,
  UserPermissionDTO,
} from './generated/role-permission/data-contracts';
import { Permissions } from './generated/role-permission/Permissions';
import { Consent } from './generated/role-permission/Consent';
import { axiosFetchAdapter } from './axiosFetchAdapter';

class RolePermissionApiClient {
  private permissionsClient: Permissions;
  private consentClient: Consent;

  constructor() {
    const baseConfig = {
      baseUrl: ENV.URL_API.ROLE_PERMISSION,
      customFetch: axiosFetchAdapter,
    };

    this.permissionsClient = new Permissions(baseConfig);
    this.consentClient = new Consent(baseConfig);
  }

  public async userPermission(): Promise<UserPermissionDTO> {
    const response = await this.permissionsClient.userPermission();
    return response.data;
  }

  public async getPortalConsent(): Promise<PortalConsentDTO> {
    const response = await this.consentClient.getPortalConsent();
    return response.data;
  }

  public async savePortalConsent(versionId?: string): Promise<void> {
    const response = await this.consentClient.savePortalConsent(
      { versionId } as any
    );
    return response.data;
  }
}

const client = new RolePermissionApiClient();

export const RolePermissionApi = {
  userPermission: () => client.userPermission(),
  getPortalConsent: () => client.getPortalConsent(),
  savePortalConsent: (versionId?: string) =>
    client.savePortalConsent(versionId),
};
