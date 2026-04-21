import { BaseApiClient } from '../BaseApiClient';

jest.mock('../BaseApiClient');

describe('RolePermissionApi (modern implementation)', () => {
  let mockSafeRequest: jest.Mock;

  const loadApi = () => {
    let RolePermissionApi: any;
    jest.isolateModules(() => {
      RolePermissionApi = require('../rolePermissionApiClient').RolePermissionApi;
    });
    return RolePermissionApi;
  };

  beforeEach(() => {
    mockSafeRequest = jest.fn();

    (BaseApiClient as jest.Mock).mockImplementation(() => ({
      safeRequest: mockSafeRequest,
    }));
  });

  it('userPermission calls safeRequest correctly and returns data', async () => {
    mockSafeRequest.mockResolvedValue({ data: { right: 'data' } });

    const RolePermissionApi = loadApi();
    const result = await RolePermissionApi.userPermission();

    expect(mockSafeRequest).toHaveBeenCalledWith({
      path: '/permissions',
      method: 'GET',
      secure: true,
      format: 'json',
    });

    expect(result).toEqual({ right: 'data' });
  });

  it('getPortalConsent calls safeRequest correctly and returns data', async () => {
    mockSafeRequest.mockResolvedValue({ data: { right: 'consent-data' } });

    const RolePermissionApi = loadApi();
    const result = await RolePermissionApi.getPortalConsent();

    expect(mockSafeRequest).toHaveBeenCalledWith({
      path: '/consent',
      method: 'GET',
      secure: true,
      format: 'json',
    });

    expect(result).toEqual({ right: 'consent-data' });
  });

  it('savePortalConsent calls safeRequest with versionId', async () => {
    mockSafeRequest.mockResolvedValue({ data: undefined });

    const RolePermissionApi = loadApi();
    await RolePermissionApi.savePortalConsent('v1');

    expect(mockSafeRequest).toHaveBeenCalledWith({
      path: '/consent',
      method: 'POST',
      secure: true,
      format: 'json',
      body: { versionId: 'v1' },
    });
  });

  it('savePortalConsent supports undefined versionId', async () => {
    mockSafeRequest.mockResolvedValue({ data: undefined });

    const RolePermissionApi = loadApi();
    await RolePermissionApi.savePortalConsent(undefined);

    expect(mockSafeRequest).toHaveBeenCalledWith({
      path: '/consent',
      method: 'POST',
      secure: true,
      format: 'json',
      body: { versionId: undefined },
    });
  });
});
