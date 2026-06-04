var mockPermissionsInstance: any;
var mockConsentInstance: any;

jest.mock('../generated/role-permission/Permissions', () => ({
  Permissions: jest.fn().mockImplementation(function (this: any) {
    this.userPermission = jest.fn();
    mockPermissionsInstance = this;
  }),
}));

jest.mock('../generated/role-permission/Consent', () => ({
  Consent: jest.fn().mockImplementation(function (this: any) {
    this.getPortalConsent = jest.fn();
    this.savePortalConsent = jest.fn();
    mockConsentInstance = this;
  }),
}));

import { RolePermissionApi } from '../rolePermissionApiClient';

describe('RolePermissionApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('userPermission returns data', async () => {
    const mockResponse = { right: 'data' };

    mockPermissionsInstance.userPermission.mockResolvedValue({
      data: mockResponse,
    });

    const result = await RolePermissionApi.userPermission();

    expect(result).toEqual(mockResponse);
    expect(mockPermissionsInstance.userPermission).toHaveBeenCalled();
  });

  it('getPortalConsent returns data', async () => {
    const mockResponse = { right: 'consent-data' };

    mockConsentInstance.getPortalConsent.mockResolvedValue({
      data: mockResponse,
    });

    const result = await RolePermissionApi.getPortalConsent();

    expect(result).toEqual(mockResponse);
    expect(mockConsentInstance.getPortalConsent).toHaveBeenCalled();
  });

  it('savePortalConsent resolves', async () => {
    mockConsentInstance.savePortalConsent.mockResolvedValue({
      data: undefined,
    });

    await RolePermissionApi.savePortalConsent('v1');

    expect(mockConsentInstance.savePortalConsent).toHaveBeenCalledWith({
      versionId: 'v1',
    });
  });

  it('propagates client error', async () => {
    const error = new Error('Network error');

    mockPermissionsInstance.userPermission.mockRejectedValue(error);

    await expect(RolePermissionApi.userPermission()).rejects.toThrow(
      'Network error'
    );
  });
});
