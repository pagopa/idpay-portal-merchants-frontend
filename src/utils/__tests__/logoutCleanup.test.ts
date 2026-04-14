import { cleanupOnLogout } from '../logoutCleanup';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    delete: jest.fn(),
  },
  storageUserOps: {
    delete: jest.fn(),
  },
}));

describe('cleanupOnLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('cleans storages and session keys', () => {
    sessionStorage.setItem('storesPagination', '{"a":1}');

    cleanupOnLogout();

    expect(storageTokenOps.delete).toHaveBeenCalledTimes(1);
    expect(storageUserOps.delete).toHaveBeenCalledTimes(1);

    expect(sessionStorage.getItem('storesPagination')).toBeNull();
  });

  it('does not throw if sessionStorage is not available', () => {
    const original = global.sessionStorage;

    delete (global as any).sessionStorage;

    expect(() => cleanupOnLogout()).not.toThrow();

    global.sessionStorage = original;
  });
});
