import { RolePermissionApi } from '../../api/rolePermissionApiClient';
import { getUserPermission, getPortalConsent, savePortalConsent } from '../rolePermissionService';

jest.mock('../../api/rolePermissionApiClient', () => ({
  RolePermissionApi: {
    userPermission: jest.fn(),
    getPortalConsent: jest.fn(),
    savePortalConsent: jest.fn(),
  },
}));

const mockedRolePermissionApi = RolePermissionApi as jest.Mocked<typeof RolePermissionApi>;

describe('rolePermissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPermission', () => {
    test('should call the API and return user permissions on success', async () => {
      const mockResponse = { role: 'admin', permissions: ['perm1'] };
      mockedRolePermissionApi.userPermission.mockResolvedValue(mockResponse);

      const result = await getUserPermission();

      expect(mockedRolePermissionApi.userPermission).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    test('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockedRolePermissionApi.userPermission.mockRejectedValue(mockError);

      await expect(getUserPermission()).rejects.toThrow(mockError);
    });
  });

  describe('getPortalConsent', () => {
    test('should call the API and return portal consent data on success', async () => {
      const mockResponse = { versionId: 'v1.0', firstAcceptance: true };
      mockedRolePermissionApi.getPortalConsent.mockResolvedValue(mockResponse);

      const result = await getPortalConsent();

      expect(mockedRolePermissionApi.getPortalConsent).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    test('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockedRolePermissionApi.getPortalConsent.mockRejectedValue(mockError);

      await expect(getPortalConsent()).rejects.toThrow(mockError);
    });
  });

  describe('savePortalConsent', () => {
    test('should call the API with the correct versionId', async () => {
      const versionId = 'v1.0-accepted';
      mockedRolePermissionApi.savePortalConsent.mockResolvedValue(undefined);

      await savePortalConsent(versionId);

      expect(mockedRolePermissionApi.savePortalConsent).toHaveBeenCalledTimes(1);
      expect(mockedRolePermissionApi.savePortalConsent).toHaveBeenCalledWith(versionId);
    });

    test('should throw an error if the API call fails', async () => {
      const versionId = 'v1.0-accepted';
      const mockError = new Error('API Error');
      mockedRolePermissionApi.savePortalConsent.mockRejectedValue(mockError);

      await expect(savePortalConsent(versionId)).rejects.toThrow(mockError);
    });
  });
});
