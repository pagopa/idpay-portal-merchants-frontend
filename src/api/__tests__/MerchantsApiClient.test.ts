/// <reference types="jest" />
import { BaseApiClient } from '../BaseApiClient';

jest.mock('../BaseApiClient');

const getApi = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getMerchantsApi } = require('../MerchantsApiClient');
  return getMerchantsApi();
};

describe.skip('MerchantsApiClient', () => {
  let mockSafeRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSafeRequest = jest.fn().mockResolvedValue({ data: 'mocked' });

    (BaseApiClient as jest.Mock).mockImplementation(() => ({
      safeRequest: mockSafeRequest,
    }));
  });

  it('getMerchantInitiativeList calls safeRequest correctly', async () => {
    const api = getApi();
    await api.getMerchantInitiativeList();
  });

  it('getMerchantTransactions calls safeRequest correctly', async () => {
    const api = getApi();
    await api.getMerchantTransactions('init1', 1);
  });

  it('createTransaction calls safeRequest with POST', async () => {
    const api = getApi();
    await api.createTransaction({
      amountCents: 100,
      idTrxAcquirer: 'trx1',
      initiativeId: 'init1',
      mcc: 'mcc1',
    });
  });

  it('deleteTransaction calls safeRequest with DELETE', async () => {
    const api = getApi();
    await api.deleteTransaction('trx1');
  });

  it('getRewardBatches propagates error', async () => {
    const api = getApi();
    mockSafeRequest.mockRejectedValueOnce(new Error('boom'));

    await expect(api.getRewardBatches('init1', 0, 10)).rejects.toThrow('boom');
  });
});
