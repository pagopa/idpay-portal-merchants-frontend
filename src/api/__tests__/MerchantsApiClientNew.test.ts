/// <reference types="jest" />
import { getMerchantsApi } from '../MerchantsApiClient';
import { BaseApiClient } from '../BaseApiClient';

describe('MerchantsApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call safeRequest with GET /initiatives and return data', async () => {
    const mockResponse = [{ id: '1', name: 'Initiative 1' }];

    const safeRequestSpy = jest.spyOn(BaseApiClient.prototype, 'safeRequest').mockResolvedValue({
      data: mockResponse,
    } as any);

    const result = await getMerchantsApi().getMerchantInitiativeList();

    expect(safeRequestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/initiatives',
        method: 'GET',
        secure: true,
        format: 'json',
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('should propagate errors from safeRequest', async () => {
    const error = new Error('Network error');

    jest.spyOn(BaseApiClient.prototype, 'safeRequest').mockRejectedValue(error);

    await expect(getMerchantsApi().getMerchantInitiativeList()).rejects.toThrow('Network error');
  });
});
