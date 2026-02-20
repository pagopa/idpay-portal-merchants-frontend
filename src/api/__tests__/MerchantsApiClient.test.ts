import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/merchants/client';
import { store } from '../../redux/store';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: vi.fn().mockReturnValue('mocked-token') },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: vi.fn((e) => e) },
}));

vi.mock('../../redux/store', () => ({
  store: { dispatch: vi.fn() },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: vi.fn(),
  extractResponse: vi.fn(),
}));

vi.mock('../generated/merchants/client', () => ({
  createClient: vi.fn(),
}));

let mockApiClient: any;

describe('MerchantApi (Vitest ESM)', () => {
  beforeEach(() => {
    vi.resetModules();

    mockApiClient = {
      getMerchantInitiativeList: vi.fn(),
      getMerchantTransactions: vi.fn(),
      getMerchantTransactionsProcessed: vi.fn(),
      getMerchantInitiativeStatistics: vi.fn(),
      getMerchantDetail: vi.fn(),
      deleteTransaction: vi.fn(),
      createTransaction: vi.fn(),
      authPaymentBarCode: vi.fn(),
      putPointOfSales: vi.fn(),
      getPointOfSales: vi.fn(),
      getPointOfSale: vi.fn(),
      getPointOfSalesWithTransactions: vi.fn(),
      getPointOfSaleTransactionsProcessed: vi.fn(),
      downloadInvoiceFile: vi.fn(),
      getReportedUser: vi.fn(),
      deleteReportedUser: vi.fn(),
      getRewardBatches: vi.fn(),
      sendRewardBatches: vi.fn(),
      postponeTransaction: vi.fn(),
      approveDownloadRewardBatch: vi.fn(),
      getAllRewardBatches: vi.fn(),
      updateInvoiceTransaction: vi.fn(),
      getMerchantTransactionsReports: vi.fn(),
      generateReport: vi.fn(),
      downloadTransactionsReport: vi.fn(),
    };

    (createClient as any).mockReturnValue(mockApiClient);
    (extractResponse as any).mockReset().mockReturnValue('extracted');
  });

  const loadApi = async () => {
    const mod = await import('../MerchantsApiClient');
    return mod.MerchantApi;
  };

  it('getMerchantInitiativeList', async () => {
    mockApiClient.getMerchantInitiativeList.mockResolvedValue({ right: 'data' });

    const MerchantApi = await loadApi();
    const result = await MerchantApi.getMerchantInitiativeList();

    expect(mockApiClient.getMerchantInitiativeList).toHaveBeenCalledWith({});
    expect(result).toBe('extracted');
  });

  it('getRewardBatches - success', async () => {
    mockApiClient.getRewardBatches.mockResolvedValue({ right: 'data' });

    const MerchantApi = await loadApi();
    const result = await MerchantApi.getRewardBatches('init1', 0, 10);

    expect(mockApiClient.getRewardBatches).toHaveBeenCalledWith({
      initiativeId: 'init1',
    });
    expect(result).toBe('extracted');
  });

  it('getRewardBatches - error returns empty object', async () => {
    mockApiClient.getRewardBatches.mockRejectedValue(new Error('boom'));

    const MerchantApi = await loadApi();
    const result = await MerchantApi.getRewardBatches('init1', 0, 10);

    expect(result).toEqual({});
  });

  it('sendRewardBatches - REWARD_BATCH_PREVIOUS_NOT_SENT', async () => {
    mockApiClient.sendRewardBatches.mockResolvedValue({
      right: { value: { code: 'REWARD_BATCH_PREVIOUS_NOT_SENT' }, status: 400 },
    });

    const MerchantApi = await loadApi();
    const result = await MerchantApi.sendRewardBatches('init1', 'batch1');

    expect(result).toBe('REWARD_BATCH_PREVIOUS_NOT_SENT');
  });

  it('downloadInvoiceFile', async () => {
    mockApiClient.downloadInvoiceFile.mockResolvedValue({ right: 'data' });

    const MerchantApi = await loadApi();
    const result = await MerchantApi.downloadInvoiceFile('trx1', 'pos1');

    expect(mockApiClient.downloadInvoiceFile).toHaveBeenCalledWith({
      transactionId: 'trx1',
      pointOfSaleId: 'pos1',
    });
    expect(result).toBe('extracted');
  });
});
