/// <reference types="jest" />

import { axiosInstance } from '../axiosInstance';
import { getMerchantsApi } from '../MerchantsApiClient';

jest.mock('../axiosInstance', () => ({
  axiosInstance: {
    request: jest.fn(),
  },
}));

describe('MerchantsApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createTransaction returns response data', async () => {
    const mockResponse = { id: 'trx1' };

    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    const api = getMerchantsApi();

    const result = await api.createTransaction({
      amountCents: 100,
      idTrxAcquirer: 'trx1',
      initiativeId: 'init1',
    });

    expect(result).toEqual(mockResponse);
    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('deleteTransaction calls axios and returns void', async () => {
    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: undefined,
      status: 204,
      statusText: 'No Content',
      headers: {},
    });

    const api = getMerchantsApi();

    await api.deleteTransaction('trx1');

    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('propagates axios error', async () => {
    const error = new Error('boom');

    (axiosInstance.request as jest.Mock).mockRejectedValue(error);

    const api = getMerchantsApi();

    await expect(api.deleteTransaction('trx1')).rejects.toThrow('boom');
  });
});
