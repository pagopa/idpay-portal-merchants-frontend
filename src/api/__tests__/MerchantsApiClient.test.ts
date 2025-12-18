import { extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import { createClient } from '../generated/merchants/client';

jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
  storageTokenOps: { read: jest.fn().mockReturnValue('mocked-token') },
}));

jest.mock('@pagopa/selfcare-common-frontend/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((e) => e) },
  appStateReducer: (state = {}, action: any) => state,
}));

jest.mock('@pagopa/selfcare-common-frontend/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn(),
}));

jest.mock('../generated/merchants/client', () => ({
  createClient: jest.fn(),
}));

let mockApiClient: any;

describe('MerchantApi', () => {
  beforeEach(() => {
    mockApiClient = {
      getMerchantInitiativeList: jest.fn(),
      getMerchantTransactions: jest.fn(),
      getMerchantTransactionsProcessed: jest.fn(),
      getMerchantInitiativeStatistics: jest.fn(),
      getMerchantDetail: jest.fn(),
      deleteTransaction: jest.fn(),
      createTransaction: jest.fn(),
      authPaymentBarCode: jest.fn(),
      putPointOfSales: jest.fn(),
      getPointOfSales: jest.fn(),
      getPointOfSale: jest.fn(),
      getPointOfSaleTransactionsProcessed: jest.fn(),
      downloadInvoiceFile: jest.fn(),
      getReportedUser: jest.fn(),
      deleteReportedUser: jest.fn(),
      getRewardBatches: jest.fn(),
      sendRewardBatches: jest.fn(),
      postponeTransaction: jest.fn(),
      approveDownloadRewardBatch: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockApiClient);
    (extractResponse as jest.Mock).mockReset().mockReturnValue('extracted');
  });

  const loadApi = () => {
    let MerchantApi: any;
    jest.isolateModules(() => {
      MerchantApi = require('../MerchantsApiClient').MerchantApi;
    });
    return MerchantApi;
  };

  it('downloadInvoiceFile', async () => {
    mockApiClient.downloadInvoiceFile.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.downloadInvoiceFile('trx1', 'pos1');

    expect(mockApiClient.downloadInvoiceFile).toHaveBeenCalledWith({
      transactionId: 'trx1',
      pointOfSaleId: 'pos1',
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('getMerchantInitiativeList', async () => {
    mockApiClient.getMerchantInitiativeList.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantInitiativeList();

    expect(mockApiClient.getMerchantInitiativeList).toHaveBeenCalledWith({});
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('getMerchantTransactions', async () => {
    mockApiClient.getMerchantTransactions.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantTransactions('init1', 1, 'fiscal', 'status');

    expect(mockApiClient.getMerchantTransactions).toHaveBeenCalledWith({
      initiativeId: 'init1',
      page: 1,
      size: 10,
      fiscalCode: 'fiscal',
      status: 'status',
    });
    expect(result).toBe('extracted');
  });

  it('getMerchantTransactions without optional params', async () => {
    mockApiClient.getMerchantTransactions.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantTransactions('init1', 1);

    expect(mockApiClient.getMerchantTransactions).toHaveBeenCalledWith({
      initiativeId: 'init1',
      page: 1,
      size: 10,
      fiscalCode: undefined,
      status: undefined,
    });
    expect(result).toBe('extracted');
  });

  it('getMerchantTransactionsProcessed', async () => {
    mockApiClient.getMerchantTransactionsProcessed.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantTransactionsProcessed({
      initiativeId: 'init1',
      page: 1,
      size: 10,
      fiscalCode: undefined,
      status: undefined,
    });

    expect(mockApiClient.getMerchantTransactionsProcessed).toHaveBeenCalledWith({
      initiativeId: 'init1',
      page: 1,
      size: 10,
      fiscalCode: undefined,
      status: undefined,
    });
    expect(result).toBe('extracted');
  });

  it('getMerchantInitiativeStatistics', async () => {
    mockApiClient.getMerchantInitiativeStatistics.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantInitiativeStatistics('init1');

    expect(mockApiClient.getMerchantInitiativeStatistics).toHaveBeenCalledWith({
      initiativeId: 'init1',
    });
    expect(result).toBe('extracted');
  });

  it('getMerchantDetail', async () => {
    mockApiClient.getMerchantDetail.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantDetail('init1');

    expect(mockApiClient.getMerchantDetail).toHaveBeenCalledWith({ initiativeId: 'init1' });
    expect(result).toBe('extracted');
  });

  it('deleteTransaction', async () => {
    mockApiClient.deleteTransaction.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.deleteTransaction('trx1');

    expect(mockApiClient.deleteTransaction).toHaveBeenCalledWith({ transactionId: 'trx1' });
    expect(result).toBe('extracted');
  });

  it('createTransaction', async () => {
    mockApiClient.createTransaction.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.createTransaction(100, 'trx1', 'init1', 'mcc1');

    expect(mockApiClient.createTransaction).toHaveBeenCalledWith({
      body: { amountCents: 100, idTrxAcquirer: 'trx1', initiativeId: 'init1', mcc: 'mcc1' },
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 201, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('createTransaction with undefined mcc', async () => {
    mockApiClient.createTransaction.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.createTransaction(100, 'trx1', 'init1', undefined);

    expect(mockApiClient.createTransaction).toHaveBeenCalledWith({
      body: { amountCents: 100, idTrxAcquirer: 'trx1', initiativeId: 'init1', mcc: undefined },
    });
    expect(result).toBe('extracted');
  });

  it('authPaymentBarCode', async () => {
    mockApiClient.authPaymentBarCode.mockResolvedValue('ok');
    const MerchantApi = loadApi();

    const result = await MerchantApi.authPaymentBarCode('trxCode', 200, 'trx1');

    expect(mockApiClient.authPaymentBarCode).toHaveBeenCalledWith({
      trxCode: 'trxCode',
      body: { amountCents: 200, idTrxAcquirer: 'trx1' },
    });
    expect(result).toBe('extracted');
  });

  it('updateMerchantPointOfSales returns error object when left', async () => {
    mockApiClient.putPointOfSales.mockResolvedValue({
      left: [{ value: 'ERR_CODE', context: [{}, { actual: { message: 'Error msg' } }] }],
    });
    const MerchantApi = loadApi();

    const result = await MerchantApi.updateMerchantPointOfSales('m1', []);

    expect(result).toEqual({ code: 'ERR_CODE', message: 'Error msg' });
  });

  it('updateMerchantPointOfSales uses actual when value is missing', async () => {
    mockApiClient.putPointOfSales.mockResolvedValue({
      left: [
        {
          actual: 'ERR_ACTUAL',
          context: [{}, { actual: { message: 'Actual error msg' } }],
        },
      ],
    });

    const MerchantApi = loadApi();

    const result = await MerchantApi.updateMerchantPointOfSales('m1', []);

    expect(result).toEqual({
      code: 'ERR_ACTUAL',
      message: 'Actual error msg',
    });
  });

  it('updateMerchantPointOfSales calls extractResponse when right', async () => {
    mockApiClient.putPointOfSales.mockResolvedValue({
      _tag: 'Right',
      right: { headers: {}, status: 204 },
    });
    const MerchantApi = loadApi();

    const result = await MerchantApi.updateMerchantPointOfSales('m1', []);

    expect(result).toBe('extracted');
  });

  it('getMerchantPointOfSales', async () => {
    mockApiClient.getPointOfSales.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantPointOfSales('m1', { page: 1 });

    expect(mockApiClient.getPointOfSales).toHaveBeenCalledWith({ merchantId: 'm1', page: 1 });
    expect(result).toBe('extracted');
  });

  it('getMerchantPointOfSalesById', async () => {
    mockApiClient.getPointOfSale.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantPointOfSalesById('m1', 'pos1');

    expect(mockApiClient.getPointOfSale).toHaveBeenCalledWith({
      merchantId: 'm1',
      pointOfSaleId: 'pos1',
    });
    expect(result).toBe('extracted');
  });

  it('getMerchantPointOfSaleTransactionsProcessed', async () => {
    mockApiClient.getPointOfSaleTransactionsProcessed.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantPointOfSaleTransactionsProcessed('init1', 'pos1', {
      page: 1,
    });

    expect(mockApiClient.getPointOfSaleTransactionsProcessed).toHaveBeenCalledWith({
      initiativeId: 'init1',
      pointOfSaleId: 'pos1',
      page: 1,
    });
    expect(result).toBe('extracted');
  });

  it('getMerchantPointOfSaleTransactionsProcessed without filters', async () => {
    mockApiClient.getPointOfSaleTransactionsProcessed.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantPointOfSaleTransactionsProcessed('init1', 'pos1');

    expect(mockApiClient.getPointOfSaleTransactionsProcessed).toHaveBeenCalledWith({
      initiativeId: 'init1',
      pointOfSaleId: 'pos1',
    });
    expect(result).toBe('extracted');
  });

  it('getReportedUser', async () => {
    mockApiClient.getReportedUser.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getReportedUser('initA', 'AAAAAA00A00A000A');

    expect(mockApiClient.getReportedUser).toHaveBeenCalledWith({
      'initiative-id': 'initA',
      userFiscalCode: 'AAAAAA00A00A000A',
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('createReportedUser sends fetch and extracts response', async () => {
    const json = jest.fn().mockResolvedValue('payload');
    global.fetch = jest.fn().mockResolvedValue({ json });

    const MerchantApi = loadApi();

    const result = await MerchantApi.createReportedUser('initiative-1', 'BBBBBB00B00B000B');

    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mocked-token',
        'initiative-id': 'initiative-1',
        'Content-Type': 'text/plain',
      },
    });
    expect(json).toHaveBeenCalled();
    expect(result).toBe('payload');
  });

  it('deleteReportedUser', async () => {
    mockApiClient.deleteReportedUser.mockResolvedValue({ right: 'ok' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.deleteReportedUser('initiative-2', 'CCCCCC00C00C000C');

    expect(mockApiClient.deleteReportedUser).toHaveBeenCalledWith({
      'initiative-id': 'initiative-2',
      userFiscalCode: 'CCCCCC00C00C000C',
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'ok' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('getRewardBatches - success', async () => {
    mockApiClient.getRewardBatches.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getRewardBatches('init1');

    expect(mockApiClient.getRewardBatches).toHaveBeenCalledWith({
      initiativeId: 'init1',
    });
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'data' },
      200,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('getRewardBatches - error path logs and returns empty object', async () => {
    const error = {
      message: 'Boom',
      name: 'Error',
      stack: 'stack-trace',
      response: {
        data: {
          errorKey: 'ERR_KEY_TEST',
        },
      },
    };

    mockApiClient.getRewardBatches.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleGroupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

    const MerchantApi = loadApi();

    const result = await MerchantApi.getRewardBatches('init1');

    expect(extractResponse).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error Key: ERR_KEY_TEST');
    expect(consoleGroupSpy).toHaveBeenCalledWith('[API ERROR] MerchantsApi.userPermission');
    expect(consoleGroupEndSpy).toHaveBeenCalled();
    expect(result).toEqual({});

    consoleErrorSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  it('getRewardBatches - error without errorKey', async () => {
    const error = {
      message: 'Boom',
      name: 'Error',
      stack: 'stack-trace',
    };

    mockApiClient.getRewardBatches.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleGroupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

    const MerchantApi = loadApi();

    const result = await MerchantApi.getRewardBatches('init1');

    expect(result).toEqual({});
    expect(consoleGroupSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });

  it('sendRewardBatches - success', async () => {
    mockApiClient.sendRewardBatches.mockResolvedValue({ right: 'ok' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.sendRewardBatches('init1', 'batch1');

    expect(mockApiClient.sendRewardBatches).toHaveBeenCalledWith({
      initiativeId: 'init1',
      batchId: 'batch1',
    });
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'ok' },
      204,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it.skip('sendRewardBatches - error with REWARD_BATCH_PREVIOUS_NOT_SENT', async () => {
    mockApiClient.sendRewardBatches.mockResolvedValue({
      left: [{ value: 'REWARD_BATCH_PREVIOUS_NOT_SENT' }],
    });
    const MerchantApi = loadApi();

    const result = await MerchantApi.sendRewardBatches('init1', 'batch1');

    expect(result).toEqual({
      code: 'REWARD_BATCH_PREVIOUS_NOT_SENT',
    });
  });

  it('sendRewardBatches - error with other code', async () => {
    mockApiClient.sendRewardBatches.mockResolvedValue({
      left: [{ value: 'OTHER_ERROR' }],
    });
    const MerchantApi = loadApi();

    const result = await MerchantApi.sendRewardBatches('init1', 'batch1');

    expect(extractResponse).toHaveBeenCalledWith(
      {
        left: [{ value: 'OTHER_ERROR' }],
      },
      204,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('postponeTransaction', async () => {
    mockApiClient.postponeTransaction.mockResolvedValue({ right: 'ok' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.postponeTransaction('init1', 'batch1', 'trx1', '2024-12-31');

    expect(mockApiClient.postponeTransaction).toHaveBeenCalledWith({
      initiativeId: 'init1',
      rewardBatchId: 'batch1',
      transactionId: 'trx1',
      initiativeEndDate: '2024-12-31',
    });
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'ok' },
      204,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('downloadBatchCsv', async () => {
    mockApiClient.approveDownloadRewardBatch.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.downloadBatchCsv('init1', 'batch1');

    expect(mockApiClient.approveDownloadRewardBatch).toHaveBeenCalledWith({
      initiativeId: 'init1',
      rewardBatchId: 'batch1',
    });
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'data' },
      200,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('logApiError - without console.groupCollapsed', async () => {
    const error = {
      message: 'Error message',
      name: 'CustomError',
      stack: 'error stack',
    };

    mockApiClient.getRewardBatches.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const originalGroupCollapsed = console.groupCollapsed;
    const originalGroupEnd = console.groupEnd;

    Object.defineProperty(console, 'groupCollapsed', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(console, 'groupEnd', {
      value: undefined,
      configurable: true,
    });

    const MerchantApi = loadApi();
    await MerchantApi.getRewardBatches('init1');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[API ERROR] MerchantsApi.userPermission');

    consoleErrorSpy.mockRestore();
    Object.defineProperty(console, 'groupCollapsed', {
      value: originalGroupCollapsed,
      configurable: true,
    });
    Object.defineProperty(console, 'groupEnd', {
      value: originalGroupEnd,
      configurable: true,
    });
  });
});