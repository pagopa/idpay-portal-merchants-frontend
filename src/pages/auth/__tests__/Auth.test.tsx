import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Auth, { readUserFromToken } from '../Auth';
import {
  trackAppError,
  trackEvent,
} from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { userFromJwtTokenAsJWTUser } from '../../../hooks/useLogin';
import ROUTES from '../../../routes';
import { ENV } from '../../../utils/env';

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackAppError: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { write: vi.fn(), read: vi.fn() },
  storageUserOps: { write: vi.fn() },
}));

vi.mock('../../../hooks/useLogin', () => ({
  userFromJwtTokenAsJWTUser: vi.fn(),
}));

vi.mock('../../../routes', () => ({
  __esModule: true,
  default: { HOME: '/home' },
}));

vi.mock('../../../utils/env', () => ({
  ENV: {
    URL_FE: { PRE_LOGIN: '/api/prelogin', LOGIN: '/login' },
  },
}));

const originalLocation = window.location;
beforeAll(() => {
  delete (window as any).location;
  (window as any).location = {
    assign: vi.fn(),
  };
});
afterAll(() => {
  window.location = originalLocation;
});

describe('readUserFromToken', () => {
  it('should parse user from token and store it', () => {
    const fakeUser = { name: 'Francesco' };
    (userFromJwtTokenAsJWTUser as vi.Mock).mockReturnValueOnce(fakeUser);

    const result = readUserFromToken('fakeToken');

    expect(userFromJwtTokenAsJWTUser).toHaveBeenCalledWith('fakeToken');
    expect(storageUserOps.write).toHaveBeenCalledWith(fakeUser);
    expect(result).toBe(fakeUser);
  });

  it('should return null if no user parsed', () => {
    (userFromJwtTokenAsJWTUser as vi.Mock).mockReturnValueOnce(null);
    const result = readUserFromToken('invalid');
    expect(result).toBeNull();
    expect(storageUserOps.write).not.toHaveBeenCalled();
  });
});

describe('Auth component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful login flow with token and redirect to HOME', async () => {
    (window as any).location.hash = '#token=validToken';

    const mockResponse = {
      headers: { get: vi.fn(() => null) },
      text: vi.fn().mockResolvedValueOnce('innerToken'),
    };
    global.fetch = vi.fn(() => Promise.resolve(mockResponse as any)) as any;

    (userFromJwtTokenAsJWTUser as vi.Mock).mockReturnValueOnce({ id: '123' });

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
      headers: { get: vi.fn(() => '/redirectUrl') },
      text: vi.fn().mockResolvedValueOnce('unused'),
    };
    global.fetch = vi.fn(() => Promise.resolve(mockResponse as any)) as any;

    render(<Auth />);

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/redirectUrl');
    });
  });

  it('should handle fetch failure and redirect to LOGIN', async () => {
    (window as any).location.hash = '#token=errorToken';
    global.fetch = vi.fn(() => Promise.reject(new Error('network error'))) as any;

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
