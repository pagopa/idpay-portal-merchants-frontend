import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/role-permission/client';

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: vi.fn().mockReturnValue('mocked-token') },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: vi.fn((e) => e) },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: vi.fn(),
  extractResponse: vi.fn(),
}));

vi.mock('../generated/role-permission/client', () => ({
  createClient: vi.fn(),
}));

let mockRolePermissionClient: any;

describe('RolePermissionApi', () => {
  beforeEach(() => {
    vi.resetModules();

    mockRolePermissionClient = {
      userPermission: vi.fn(),
      getPortalConsent: vi.fn(),
      savePortalConsent: vi.fn(),
    };

    (createClient as any).mockReturnValue(mockRolePermissionClient);
    (extractResponse as any).mockReset().mockReturnValue('extracted');
  });

  it('userPermission calls client and extractResponse', async () => {
    mockRolePermissionClient.userPermission.mockResolvedValue({ right: 'data' });

    const { RolePermissionApi } = await import('../rolePermissionApiClient');

    const result = await RolePermissionApi.userPermission();

    expect(mockRolePermissionClient.userPermission).toHaveBeenCalledWith({});
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'data' },
      200,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('getPortalConsent calls client and extractResponse', async () => {
    mockRolePermissionClient.getPortalConsent.mockResolvedValue({
      right: 'consent-data',
    });

    const { RolePermissionApi } = await import('../rolePermissionApiClient');

    const result = await RolePermissionApi.getPortalConsent();

    expect(mockRolePermissionClient.getPortalConsent).toHaveBeenCalledWith({});
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'consent-data' },
      200,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('savePortalConsent calls client and extractResponse with versionId', async () => {
    mockRolePermissionClient.savePortalConsent.mockResolvedValue({
      right: 'saved',
    });

    const { RolePermissionApi } = await import('../rolePermissionApiClient');

    const result = await RolePermissionApi.savePortalConsent('v1');

    expect(mockRolePermissionClient.savePortalConsent).toHaveBeenCalledWith({
      body: { versionId: 'v1' },
    });
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'saved' },
      200,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });
});
