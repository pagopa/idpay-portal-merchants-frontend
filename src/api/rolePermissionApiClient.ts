import { ENV } from "../utils/env";
import { BaseApiClient } from "./BaseApiClient";
import {
  PortalConsentDTO,
  UserPermissionDTO,
} from "./generated/role-permission/data-contracts";

/**
 * RolePermissionApiClient
 *
 * ✅ Modern implementation
 * ✅ Uses BaseApiClient
 * ✅ No Redux coupling
 * ✅ No storageTokenOps
 * ✅ No extractResponse
 * ✅ Security handled by BaseApiClient
 */
class RolePermissionApiClient {
  private baseClient: BaseApiClient;

  constructor() {
    this.baseClient = new BaseApiClient({
      baseUrl: ENV.URL_API.ROLE_PERMISSION,
    });
  }

  public async userPermission(): Promise<UserPermissionDTO> {
    const response = await this.baseClient.safeRequest<UserPermissionDTO>({
      path: "/permissions",
      method: "GET",
      secure: true,
      format: "json",
    });

    return response.data;
  }

  public async getPortalConsent(): Promise<PortalConsentDTO> {
    const response = await this.baseClient.safeRequest<PortalConsentDTO>({
      path: "/consent",
      method: "GET",
      secure: true,
      format: "json",
    });

    return response.data;
  }

  public async savePortalConsent(
    versionId?: string
  ): Promise<void> {
    await this.baseClient.safeRequest<void>({
      path: "/consent",
      method: "POST",
      secure: true,
      format: "json",
      body: { versionId },
    });
  }
}

const client = new RolePermissionApiClient();

export const RolePermissionApi = {
  userPermission: () => client.userPermission(),
  getPortalConsent: () => client.getPortalConsent(),
  savePortalConsent: (versionId?: string) =>
    client.savePortalConsent(versionId),
};
