/// <reference types="jest" />
import { BaseApiClient } from '../BaseApiClient';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    read: jest.fn(),
  },
}));

describe('BaseApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();
  });

  it('should preserve custom headers when calling safeRequest', async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('mocked-token');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const client = new BaseApiClient({
      baseUrl: 'http://localhost',
    });

    await client.safeRequest({
      path: '/test',
      method: 'GET',
      headers: {
        'initiative-id': 'initiative-123',
      },
      secure: true,
      format: 'json',
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const fetchOptions = fetchCall[1];

    expect(fetchOptions.headers.get('initiative-id')).toBe('initiative-123');
    expect(fetchOptions.headers.get('Authorization')).toBeNull();
  });

  it('should dispatch error on 401 and return business error if present', async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('mocked-token');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        code: 'UNAUTHORIZED',
        message: 'Token expired',
      }),
    });

    const client = new BaseApiClient({
      baseUrl: 'http://localhost',
    });

    const result = await client.safeRequest({
      path: '/secure',
      method: 'GET',
      secure: true,
      format: 'json',
    });

    expect(result.data).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Token expired',
    });
  });

  it('should throw ApiError on technical error without business body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const client = new BaseApiClient({
      baseUrl: 'http://localhost',
    });

    await expect(
      client.safeRequest({
        path: '/error',
        method: 'GET',
        format: 'json',
      })
    ).rejects.toThrow('API Error - 500');
  });
});
