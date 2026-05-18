/// <reference types="jest" />

import { axiosInstance } from '../axiosInstance';
import { RolePermissionApi } from '../rolePermissionApiClient';

jest.mock('../axiosInstance', () => ({
  axiosInstance: {
    request: jest.fn(),
  },
}));

describe('RolePermissionApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('userPermission returns data', async () => {
    const mockResponse = { right: 'data' };

    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    const result = await RolePermissionApi.userPermission();

    expect(result).toEqual(mockResponse);
    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('getPortalConsent returns data', async () => {
    const mockResponse = { right: 'consent-data' };

    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    const result = await RolePermissionApi.getPortalConsent();

    expect(result).toEqual(mockResponse);
    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('savePortalConsent resolves', async () => {
    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: undefined,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    await RolePermissionApi.savePortalConsent('v1');

    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('propagates axios error', async () => {
    const error = new Error('Network error');

    (axiosInstance.request as jest.Mock).mockRejectedValue(error);

    await expect(RolePermissionApi.userPermission()).rejects.toThrow(
      'Network error'
    );
  });
});
