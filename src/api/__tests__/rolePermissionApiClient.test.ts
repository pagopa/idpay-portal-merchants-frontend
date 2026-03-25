import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/role-permission/client';

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn().mockReturnValue('mocked-token') },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((e) => e) },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
  t: jest.fn((key) => key),
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('../generated/role-permission/client', () => ({
  createClient: jest.fn(),
}));

let mockRolePermissionClient: any;

describe('RolePermissionApi', () => {
  beforeEach(() => {
    mockRolePermissionClient = {
      userPermission: jest.fn(),
      getPortalConsent: jest.fn(),
      savePortalConsent: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockRolePermissionClient);
    (extractResponse as jest.Mock).mockReset().mockReturnValue('extracted');
  });

  const loadApi = () => {
    let RolePermissionApi: any;
    jest.isolateModules(() => {
      RolePermissionApi = require('../rolePermissionApiClient').RolePermissionApi;
    });
    return RolePermissionApi;
  };

  it('userPermission calls client and extractResponse', async () => {
    mockRolePermissionClient.userPermission.mockResolvedValue({ right: 'data' });

    const RolePermissionApi = loadApi();

    const result = await RolePermissionApi.userPermission();

    expect(mockRolePermissionClient.userPermission).toHaveBeenCalledWith({});
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('getPortalConsent calls client and extractResponse', async () => {
    mockRolePermissionClient.getPortalConsent.mockResolvedValue({ right: 'consent-data' });

    const RolePermissionApi = loadApi();

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
    mockRolePermissionClient.savePortalConsent.mockResolvedValue({ right: 'saved' });

    const RolePermissionApi = loadApi();

    const result = await RolePermissionApi.savePortalConsent('v1');

    expect(mockRolePermissionClient.savePortalConsent).toHaveBeenCalledWith({
      body: { versionId: 'v1' },
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'saved' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('savePortalConsent supports undefined versionId', async () => {
    mockRolePermissionClient.savePortalConsent.mockResolvedValue({ right: 'saved' });

    const RolePermissionApi = loadApi();

    await RolePermissionApi.savePortalConsent(undefined);

    expect(mockRolePermissionClient.savePortalConsent).toHaveBeenCalledWith({
      body: { versionId: undefined },
    });
  });

  it('calls redirect callback when extractResponse triggers it', async () => {
    const { store } = require('../../redux/store');
    store.dispatch = jest.fn();

    (extractResponse as jest.Mock).mockImplementation(async (_res, _status, callback) => {
      callback();
      return 'extracted';
    });

    mockRolePermissionClient.userPermission.mockResolvedValue({ right: 'data' });

    const RolePermissionApi = loadApi();

    await RolePermissionApi.userPermission();

    expect(store.dispatch).toHaveBeenCalled();
  });
});
