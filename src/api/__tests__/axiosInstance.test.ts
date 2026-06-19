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

import { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { store } from '../../redux/store';
import { cleanupOnLogout } from '../../utils/logoutCleanup';
import { axiosInstance } from '../axiosInstance';
import { ApiError } from '../ApiError';

// ---------------------------------------------------------------------------
// Helpers to build a mock adapter
// ---------------------------------------------------------------------------

function makeSuccessAdapter(data: unknown = {}, status = 200) {
  return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  });
}

function makeErrorAdapter(status: number, data: unknown) {
  return async (config: InternalAxiosRequestConfig): Promise<never> => {
    const response: AxiosResponse = {
      data,
      status,
      statusText: 'Error',
      headers: new AxiosHeaders(),
      config,
    };
    const err = new AxiosError('Request failed', String(status), config, null, response);
    throw err;
  };
}

// ---------------------------------------------------------------------------
// Request interceptor
// ---------------------------------------------------------------------------

describe('axiosInstance – request interceptor', () => {
  it('returns config unchanged when no token is available', async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue(null);

    let capturedConfig: InternalAxiosRequestConfig | undefined;
    (axiosInstance.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => {
      capturedConfig = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };

    await axiosInstance.get('/test');

    expect(capturedConfig?.headers?.Authorization).toBeUndefined();
  });

  it('injects Authorization Bearer header when a token is present', async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('test-token-abc');

    let capturedConfig: InternalAxiosRequestConfig | undefined;
    (axiosInstance.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => {
      capturedConfig = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };

    await axiosInstance.get('/test');

    expect(capturedConfig?.headers?.Authorization).toBe('Bearer test-token-abc');
  });
});

// ---------------------------------------------------------------------------
// Response interceptor – success path
// ---------------------------------------------------------------------------

describe('axiosInstance – response interceptor (success)', () => {
  it('passes a 200 response through unchanged', async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue(null);

    (axiosInstance.defaults as any).adapter = makeSuccessAdapter({ id: 42 }, 200);

    const response = await axiosInstance.get('/test');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ id: 42 });
  });
});

// ---------------------------------------------------------------------------
// Response interceptor – error paths
// ---------------------------------------------------------------------------

describe('axiosInstance – response interceptor (error handling)', () => {
  let assignMock: jest.Mock;

  beforeEach(() => {
    assignMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: assignMock },
      configurable: true,
      writable: true,
    });
    (appStateActions.addError as unknown as jest.Mock).mockReturnValue({ type: 'app/addError' });
    (storageTokenOps.read as jest.Mock).mockReturnValue(null);
  });

  it('dispatches addError, calls cleanupOnLogout, and redirects on 401', async () => {
    (axiosInstance.defaults as any).adapter = makeErrorAdapter(401, null);

    await expect(axiosInstance.get('/test')).rejects.toBeInstanceOf(ApiError);

    expect(appStateActions.addError).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'tokenNotValid',
        toNotify: false,
        blocking: false,
        techDescription: 'Unauthorized - token invalid or expired',
      })
    );
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'app/addError' });
    expect(cleanupOnLogout).toHaveBeenCalled();
    expect(assignMock).toHaveBeenCalledWith('https://example.com/logout');
  });

  it('rejects with ApiError containing code and message from error body', async () => {
    (axiosInstance.defaults as any).adapter = makeErrorAdapter(400, {
      code: 'ERR_VALIDATION',
      message: 'Invalid input',
    });

    await expect(axiosInstance.get('/test')).rejects.toMatchObject({
      status: 400,
      message: 'Invalid input',
      code: 'ERR_VALIDATION',
    });
    await expect(axiosInstance.get('/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('parses code and message when a 400 error body is returned as ArrayBuffer', async () => {
    (axiosInstance.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => {
      const payload = JSON.stringify({
        code: 'POINT_OF_SALE_ALREADY_REGISTERED',
        message: 'PointOfSales with the same functional key already exists',
      });
      const data = Buffer.from(payload, 'utf-8');
      const response: AxiosResponse = {
        data,
        status: 400,
        statusText: 'Bad Request',
        headers: new AxiosHeaders(),
        config,
      };
      const err = new AxiosError('Request failed with status code 400', '400', config, null, response);
      throw err;
    };

    await expect(axiosInstance.get('/test')).rejects.toMatchObject({
      status: 400,
      message: 'PointOfSales with the same functional key already exists',
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
    });
  });

  it('rejects with fallback ApiError when error body has no code or message', async () => {
    (axiosInstance.defaults as any).adapter = makeErrorAdapter(500, {});

    await expect(axiosInstance.get('/test')).rejects.toMatchObject({
      status: 500,
    });
    await expect(axiosInstance.get('/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('uses error.message as fallback when errorBody is null', async () => {
    // makeErrorAdapter creates AxiosError with message 'Request failed'
    (axiosInstance.defaults as any).adapter = makeErrorAdapter(503, null);

    await expect(axiosInstance.get('/test')).rejects.toMatchObject({
      status: 503,
      message: 'Request failed',
    });
  });

  it('falls through to API Error literal when errorBody has code but no message and error.message is empty', async () => {
    // Covers line 55 branch: code truthy but message falsy → goes to fallback path
    // Covers line 62 branch: errorBody.message falsy AND error.message falsy → 'API Error'
    (axiosInstance.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => {
      const response: AxiosResponse = {
        data: { code: 'SOME_CODE' }, // code present, message absent
        status: 503,
        statusText: 'Service Unavailable',
        headers: new AxiosHeaders(),
        config,
      };
      const err = new AxiosError('', '503', config, null, response);
      throw err;
    };

    await expect(axiosInstance.get('/test')).rejects.toMatchObject({
      status: 503,
      message: 'API Error',
      code: 'SOME_CODE',
    });
  });

  it('uses errorBody.message when available and code is absent', async () => {
    (axiosInstance.defaults as any).adapter = makeErrorAdapter(422, {
      message: 'Unprocessable entity',
    });

    await expect(axiosInstance.get('/test')).rejects.toMatchObject({
      status: 422,
      message: 'Unprocessable entity',
    });
  });

  it('uses status 500 as fallback when response is absent', async () => {
    // Simulate a network error where there is no response at all
    (axiosInstance.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => {
      const err = new AxiosError('Network Error', 'ERR_NETWORK', config, null, undefined);
      throw err;
    };

    await expect(axiosInstance.get('/test')).rejects.toMatchObject({
      status: 500,
      message: 'Network Error',
    });
  });
});
