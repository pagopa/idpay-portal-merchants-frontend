import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useDispatch } from 'react-redux';
import { CONFIG } from '@pagopa/selfcare-common-frontend/config/env';
import { userActions } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import { parseJwt } from '../../utils/jwt-utils';
import { getUserPermission } from '../../services/rolePermissionService';
import { setUserRole, setPermissionsList } from '../../redux/slices/permissionsSlice';
import { useLogin, userFromJwtToken, userFromJwtTokenAsJWTUser } from '../useLogin';

jest.mock('react-redux');
jest.mock('@pagopa/selfcare-common-frontend/config/env');
jest.mock('@pagopa/selfcare-common-frontend/utils/storage');
jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');
jest.mock('react-i18next');
jest.mock('../../utils/jwt-utils');
jest.mock('../../services/rolePermissionService', () => ({
  getUserPermission: jest.fn(),
}));

const mockedUseDispatch = useDispatch as jest.Mock;
const mockedStorageTokenOps = storageTokenOps as jest.Mocked<typeof storageTokenOps>;
const mockedStorageUserOps = storageUserOps as jest.Mocked<typeof storageUserOps>;
const mockedUseErrorDispatcher = useErrorDispatcher as jest.Mock;
const mockedParseJwt = parseJwt as jest.Mock;
const mockedGetUserPermission = getUserPermission as jest.Mock;

const mockJwtPayload = {
  uid: 'test-uid-123',
  name: 'Mario',
  family_name: 'Rossi',
  email: 'mario.rossi@test.it',
  org_name: 'Comune di Test',
  org_party_role: 'ADMIN',
  org_role: 'admin',
};

const mockToken = 'mock-jwt-token';

describe('JWT Helper Functions', () => {
  beforeEach(() => {
    mockedParseJwt.mockReturnValue(mockJwtPayload);
  });

  test('userFromJwtToken should correctly map JWT payload to User object', () => {
    const user = userFromJwtToken(mockToken);
    expect(mockedParseJwt).toHaveBeenCalledWith(mockToken);
    expect(user).toEqual({
      uid: 'test-uid-123',
      taxCode: '',
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@test.it',
      org_party_role: 'ADMIN',
      org_role: 'admin',
    });
  });

  test('userFromJwtTokenAsJWTUser should correctly map JWT payload to IDPayUser object', () => {
    const idPayUser = userFromJwtTokenAsJWTUser(mockToken);
    expect(mockedParseJwt).toHaveBeenCalledWith(mockToken);
    expect(idPayUser).toEqual({
      uid: 'test-uid-123',
      taxCode: '',
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@test.it',
      org_name: 'Comune di Test',
      org_party_role: 'ADMIN',
      org_role: 'admin',
    });
  });
});

describe('useLogin', () => {
  const mockDispatch = jest.fn();
  const mockAddError = jest.fn();
  const assign = window.location.assign;

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        assign: jest.fn(),
      },
      writable: true,
    });
  });

  afterAll(() => {
    window.location.assign = assign;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDispatch.mockReturnValue(mockDispatch);
    mockedUseErrorDispatcher.mockReturnValue(mockAddError);
    (useTranslation as jest.Mock).mockReturnValue({ t: (key: string) => key });
    (window.location.assign as jest.Mock).mockClear();
  });

  test('should do nothing and redirect to login if no token is found', async () => {
    (CONFIG.MOCKS.MOCK_USER as boolean) = false;
    mockedStorageTokenOps.read.mockReturnValue(null);

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.attemptSilentLogin();
    });

    expect(mockedStorageUserOps.delete).toHaveBeenCalledTimes(1);
    expect(window.location.assign).toHaveBeenCalledWith(CONFIG.URL_FE.LOGIN);
  });

  test('should use token from storage to set user if session user is empty', async () => {
    (CONFIG.MOCKS.MOCK_USER as boolean) = false;
    mockedStorageTokenOps.read.mockReturnValue(mockToken);
    mockedStorageUserOps.read.mockReturnValue(null);
    mockedParseJwt.mockReturnValue(mockJwtPayload);
    mockedGetUserPermission.mockResolvedValue({ role: 'admin', permissions: ['perm1'] });
    const expectedUser = userFromJwtToken(mockToken);

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.attemptSilentLogin();
    });

    await waitFor(() => {
      expect(mockedStorageUserOps.write).toHaveBeenCalledWith(expectedUser);
      expect(mockDispatch).toHaveBeenCalledWith(userActions.setLoggedUser(expectedUser));
      expect(mockedGetUserPermission).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(setUserRole('admin'));
      expect(mockDispatch).toHaveBeenCalledWith(setPermissionsList(['perm1']));
    });
  });

  test('should use user from session storage if present', async () => {
    const sessionUser = { name: 'Session', surname: 'User' };
    (CONFIG.MOCKS.MOCK_USER as boolean) = false;
    mockedStorageTokenOps.read.mockReturnValue(mockToken);
    mockedStorageUserOps.read.mockReturnValue(sessionUser);
    mockedGetUserPermission.mockResolvedValue({ role: 'admin', permissions: [] });

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.attemptSilentLogin();
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(userActions.setLoggedUser(sessionUser));
      expect(mockedStorageUserOps.write).not.toHaveBeenCalled();
      expect(mockedGetUserPermission).toHaveBeenCalledTimes(1);
    });
  });

  test('should call addError if getUserPermission fails', async () => {
    const mockError = new Error('Permission Denied');
    (CONFIG.MOCKS.MOCK_USER as boolean) = false;
    mockedStorageTokenOps.read.mockReturnValue(mockToken);
    mockedStorageUserOps.read.mockReturnValue(null);

    mockedParseJwt.mockReturnValue(mockJwtPayload);

    mockedGetUserPermission.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.attemptSilentLogin();
    });

    await waitFor(() => {
      expect(mockAddError).toHaveBeenCalledTimes(1);
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'GET_USER_PERMISSIONS' })
      );
    });
  });
});
