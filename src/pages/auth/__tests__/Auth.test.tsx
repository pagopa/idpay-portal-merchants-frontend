import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  trackAppError,
  trackEvent,
} from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { userFromJwtTokenAsJWTUser } from '../../../hooks/useLogin';
import { ENV } from '../../../utils/env';
import ROUTES from '../../../routes';
import Auth, { readUserFromToken } from '../Auth';

jest.mock('@pagopa/selfcare-common-frontend/services/analyticsService');
jest.mock('@pagopa/selfcare-common-frontend/utils/storage');
jest.mock('../../../hooks/useLogin');

const mockedUserFromJwtToken = userFromJwtTokenAsJWTUser as jest.Mock;
const mockedStorageUserOps = storageUserOps as jest.Mocked<typeof storageUserOps>;
const mockedStorageTokenOps = storageTokenOps as jest.Mocked<typeof storageTokenOps>;
const mockedTrackEvent = trackEvent as jest.Mock;
const mockedTrackAppError = trackAppError as jest.Mock;

describe('readUserFromToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call userFromJwtToken and write to storage if user is valid', () => {
    const mockUser = { name: 'Test', surname: 'User' };
    mockedUserFromJwtToken.mockReturnValue(mockUser);

    const result = readUserFromToken('fake-token');

    expect(mockedUserFromJwtToken).toHaveBeenCalledWith('fake-token');
    expect(mockedStorageUserOps.write).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockUser);
  });

  test('should not write to storage if user is falsy', () => {
    mockedUserFromJwtToken.mockReturnValue(null);
    readUserFromToken('fake-token');
    expect(mockedStorageUserOps.write).not.toHaveBeenCalled();
  });
});

describe('Auth component', () => {
  const originalLocation = window.location;
  const mockAssign = jest.fn();
  const mockFetch = jest.fn();

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        assign: mockAssign,
      },
      writable: true,
    });
    global.fetch = mockFetch;
  });

  afterAll(() => {
    window.location = originalLocation;
    (global.fetch as jest.Mock).mockClear();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle successful login, fetch inner token, and redirect to HOME', async () => {
    const urlToken = 'fake-url-token';
    const innerToken = 'fake-inner-token';
    const mockUser = { name: 'Test', surname: 'User' };
    window.location.hash = `#token=${urlToken}`;
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(innerToken),
    });
    mockedUserFromJwtToken.mockReturnValue(mockUser);

    render(<Auth />);

    await waitFor(() => {
      expect(mockedTrackEvent).toHaveBeenCalledWith('AUTH_SUCCESS');
      expect(mockFetch).toHaveBeenCalledWith(ENV.URL_FE.PRE_LOGIN, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${urlToken}`,
        },
      });
      expect(mockedStorageTokenOps.write).toHaveBeenCalledWith(innerToken);
      expect(mockedUserFromJwtToken).toHaveBeenCalledWith(innerToken);
      expect(mockedStorageUserOps.write).toHaveBeenCalledWith(mockUser);
      expect(mockAssign).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });

  test('should redirect to LOGIN if no token is in the hash', async () => {
    window.location.hash = '';

    render(<Auth />);

    await waitFor(() => {
      expect(mockedTrackAppError).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'INVALIDAUTHREQUEST' })
      );
      expect(mockAssign).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
    });
  });

  test('should redirect to LOGIN if the fetch for the inner token fails', async () => {
    window.location.hash = '#token=some-token';
    mockFetch.mockRejectedValue(new Error('Fetch failed'));

    render(<Auth />);

    await waitFor(() => {
      expect(mockedTrackEvent).toHaveBeenCalledWith('AUTH_SUCCESS');
      expect(mockAssign).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
    });

    expect(mockedStorageTokenOps.write).not.toHaveBeenCalled();
  });
});
