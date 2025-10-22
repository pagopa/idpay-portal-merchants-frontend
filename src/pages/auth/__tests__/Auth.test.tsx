import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Auth, { readUserFromToken } from '../Auth';
import {
  trackAppError,
  trackEvent,
} from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { userFromJwtTokenAsJWTUser } from '../../../hooks/useLogin';
import ROUTES from '../../../routes';
import { ENV } from '../../../utils/env';

jest.mock('@pagopa/selfcare-common-frontend/services/analyticsService', () => ({
  trackAppError: jest.fn(),
  trackEvent: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
  storageTokenOps: { write: jest.fn(), read: jest.fn() },
  storageUserOps: { write: jest.fn() },
}));

jest.mock('../../../hooks/useLogin', () => ({
  userFromJwtTokenAsJWTUser: jest.fn(),
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: { HOME: '/home' },
}));

jest.mock('../../../utils/env', () => ({
  ENV: {
    URL_FE: { PRE_LOGIN: '/api/prelogin', LOGIN: '/login' },
  },
}));

const originalLocation = window.location;
beforeAll(() => {
  delete (window as any).location;
  (window as any).location = {
    assign: jest.fn(),
  };
});
afterAll(() => {
  window.location = originalLocation;
});

describe('readUserFromToken', () => {
  it('should parse user from token and store it', () => {
    const fakeUser = { name: 'Francesco' };
    (userFromJwtTokenAsJWTUser as jest.Mock).mockReturnValueOnce(fakeUser);

    const result = readUserFromToken('fakeToken');

    expect(userFromJwtTokenAsJWTUser).toHaveBeenCalledWith('fakeToken');
    expect(storageUserOps.write).toHaveBeenCalledWith(fakeUser);
    expect(result).toBe(fakeUser);
  });

  it('should return null if no user parsed', () => {
    (userFromJwtTokenAsJWTUser as jest.Mock).mockReturnValueOnce(null);
    const result = readUserFromToken('invalid');
    expect(result).toBeNull();
    expect(storageUserOps.write).not.toHaveBeenCalled();
  });
});

describe('Auth component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful login flow with token and redirect to HOME', async () => {
    (window as any).location.hash = '#token=validToken';

    const mockResponse = {
      headers: { get: jest.fn(() => null) },
      text: jest.fn().mockResolvedValueOnce('innerToken'),
    };
    global.fetch = jest.fn(() => Promise.resolve(mockResponse as any)) as any;

    (userFromJwtTokenAsJWTUser as jest.Mock).mockReturnValueOnce({ id: '123' });

    render(<Auth />);

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('AUTH_SUCCESS');
      expect(storageTokenOps.write).toHaveBeenCalledWith('innerToken');
      expect(window.location.assign).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });

  it('should redirect to x-location-to header if present', async () => {
    (window as any).location.hash = '#token=headerToken';
    const mockResponse = {
      headers: { get: jest.fn(() => '/redirectUrl') },
      text: jest.fn().mockResolvedValueOnce('unused'),
    };
    global.fetch = jest.fn(() => Promise.resolve(mockResponse as any)) as any;

    render(<Auth />);

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/redirectUrl');
    });
  });

  it('should handle fetch failure and redirect to LOGIN', async () => {
    (window as any).location.hash = '#token=errorToken';
    global.fetch = jest.fn(() => Promise.reject(new Error('network error'))) as any;

    render(<Auth />);

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
    });
  });

  it('should call trackAppError if no token in URL', async () => {
    (window as any).location.hash = '';
    render(<Auth />);

    await waitFor(() => {
      expect(trackAppError).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'INVALIDAUTHREQUEST',
          toNotify: true,
        })
      );
      expect(window.location.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
    });
  });
});
