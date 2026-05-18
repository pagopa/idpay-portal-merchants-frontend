/// <reference types="jest" />

import { axiosInstance } from '../axiosInstance';
import { AutocompleteApi } from '../AutocompleteApiClient';

jest.mock('../axiosInstance', () => ({
  axiosInstance: {
    request: jest.fn(),
  },
}));

describe('AutocompleteApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns response.data when call succeeds', async () => {
    const mockResponse = {
      ResultItems: [],
    };

    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    const result = await AutocompleteApi.getAddresses({
      QueryText: 'via roma',
    } as any);

    expect(result).toEqual(mockResponse);
    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('propagates axios error', async () => {
    const error = new Error('Bad request');

    (axiosInstance.request as jest.Mock).mockRejectedValue(error);

    await expect(
      AutocompleteApi.getAddresses({ QueryText: 'invalid' } as any)
    ).rejects.toThrow('Bad request');
  });
});
