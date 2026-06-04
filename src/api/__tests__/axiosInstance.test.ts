jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn() },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: {
    addError: jest.fn(),
  },
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('../../utils/logoutCleanup', () => ({
  cleanupOnLogout: jest.fn(),
}));

jest.mock('../../utils/env', () => ({
  ENV: {
    URL_FE: {
      LOGOUT: 'https://example.com/logout',
    },
  },
}));

import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { store } from '../../redux/store';
import { cleanupOnLogout } from '../../utils/logoutCleanup';
import { axiosInstance } from '../axiosInstance';
import { ApiError } from '../ApiError';

const getRequestFulfilled = (): ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) =>
  (axiosInstance.interceptors.request as any).handlers[0].fulfilled;

const getResponseFulfilled = (): ((response: AxiosResponse) => AxiosResponse) =>
  (axiosInstance.interceptors.response as any).handlers[0].fulfilled;

const getResponseRejected = (): ((error: unknown) => Promise<never>) =>
  (axiosInstance.interceptors.response as any).handlers[0].rejected;

describe('axiosInstance - request interceptor', () => {
  it('returns config unchanged when no token is available', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue(null);

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = getRequestFulfilled()(config);

    expect(result).toBe(config);
    expect((result.headers as any).Authorization).toBeUndefined();
  });

  it('adds Authorization Bearer header when token is present', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('my-token');

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = getRequestFulfilled()(config);

    expect(result).not.toBe(config);
    expect((result.headers as any).Authorization).toBe('Bearer my-token');
  });
});

describe('axiosInstance - response interceptor', () => {
  it('passes through a successful response unchanged', () => {
    const response = { status: 200, data: { id: 1 } } as AxiosResponse;
    const result = getResponseFulfilled()(response);
    expect(result).toBe(response);
  });

  it('dispatches addError, calls cleanupOnLogout and redirects on 401', async () => {
    const assignMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: assignMock },
      configurable: true,
      writable: true,
    });

    (appStateActions.addError as unknown as jest.Mock).mockReturnValue({ type: 'app/addError' });

    const error = {
      response: { status: 401, data: null },
      message: 'Unauthorized',
    };

    await expect(getResponseRejected()(error)).rejects.toBeInstanceOf(ApiError);

    expect(appStateActions.addError).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tokenNotValid' })
    );
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'app/addError' });
    expect(cleanupOnLogout).toHaveBeenCalled();
    expect(assignMock).toHaveBeenCalledWith('https://example.com/logout');
  });

  it('rejects with ApiError containing code and message from error body', async () => {
    const error = {
      response: {
        status: 400,
        data: { code: 'ERR_001', message: 'Bad request' },
      },
      message: 'Request failed with status 400',
    };

    await expect(getResponseRejected()(error)).rejects.toMatchObject({
      status: 400,
      message: 'Bad request',
      code: 'ERR_001',
    });

    await expect(getResponseRejected()(error)).rejects.toBeInstanceOf(ApiError);
  });

  it('rejects with fallback ApiError when error body has no code or message', async () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
      message: 'Internal server error',
    };

    await expect(getResponseRejected()(error)).rejects.toMatchObject({
      status: 500,
      message: 'Internal server error',
    });

    await expect(getResponseRejected()(error)).rejects.toBeInstanceOf(ApiError);
  });

  it('uses status 500 as fallback when response is undefined', async () => {
    const error = {
      response: undefined,
      message: 'Network Error',
    };

    await expect(getResponseRejected()(error)).rejects.toMatchObject({
      status: 500,
      message: 'Network Error',
    });
  });

  it('uses "API Error" as message fallback when neither body nor error message exist', async () => {
    const error = {
      response: { status: 503, data: null },
      message: undefined,
    };

    await expect(getResponseRejected()(error)).rejects.toMatchObject({
      status: 503,
      message: 'API Error',
    });
  });

  it('uses errorBody.message over error.message in fallback path', async () => {
    const error = {
      response: {
        status: 422,
        data: { message: 'Unprocessable entity' },
      },
      message: 'Request failed',
    };

    await expect(getResponseRejected()(error)).rejects.toMatchObject({
      status: 422,
      message: 'Unprocessable entity',
    });
  });
});
