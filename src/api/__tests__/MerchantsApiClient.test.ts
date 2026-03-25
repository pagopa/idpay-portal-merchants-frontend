import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/merchants/client';
import { store } from '../../redux/store';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn().mockReturnValue('mocked-token') },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((e) => e) },
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn(),
}));

jest.mock('../generated/merchants/client', () => ({
  createClient: jest.fn(),
}));

let mockApiClient: any;

store.dispatch = jest.fn();

describe('MerchantApi', () => {
  beforeEach(() => {
    if (!(console as any).groupCollapsed) {
      (console as any).groupCollapsed = jest.fn();
    }
    if (!(console as any).groupEnd) {
      (console as any).groupEnd = jest.fn();
    }

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
      getPointOfSalesWithTransactions: jest.fn(),
      getPointOfSaleTransactionsProcessed: jest.fn(),
      downloadInvoiceFile: jest.fn(),
      getReportedUser: jest.fn(),
      deleteReportedUser: jest.fn(),
      getRewardBatches: jest.fn(),
      getRewardBatchById: jest.fn(),
      sendRewardBatches: jest.fn(),
      postponeTransaction: jest.fn(),
      approveDownloadRewardBatch: jest.fn(),
      getAllRewardBatches: jest.fn()
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

  describe('MerchantsApiClient uncovered branches', () => {
    it('getRewardBatches catch branch throws error', async () => {
      const client = require('../generated/merchants/client');
      const MerchantApi = loadApi();
      client.createClient().getRewardBatches = jest.fn().mockRejectedValue(new Error('error'));

      await expect(
        MerchantApi.getRewardBatches('id', 0, 10)
      ).rejects.toThrow('error');
    });

    it('getAllRewardBatches catch branch throws error', async () => {
      const client = require('../generated/merchants/client');
      client.createClient().getRewardBatches = jest.fn().mockRejectedValue(new Error('error'));
      const MerchantApi = loadApi();

      await expect(
        MerchantApi.getAllRewardBatches('id')
      ).rejects.toThrow('error');
    });

    it('sendRewardBatches handles REWARD_BATCH_PREVIOUS_NOT_SENT', async () => {
      const client = require('../generated/merchants/client');
      client.createClient().sendRewardBatches = jest.fn().mockResolvedValue({
        right: {
          status: 400,
          value: { code: 'REWARD_BATCH_PREVIOUS_NOT_SENT' },
        },
      });
      const MerchantApi = loadApi();
      const res = await MerchantApi.sendRewardBatches('id', 'batch');
      expect(res).toBe('REWARD_BATCH_PREVIOUS_NOT_SENT');
    });
  });


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

  it('getMerchantPointOfSalesWithTransactions resolved', async () => {
    const json = jest.fn().mockResolvedValue("test");
    global.fetch = jest.fn().mockResolvedValue({ok: true, json});

    const MerchantApi = loadApi();

    const resolvedResult = await MerchantApi.getMerchantPointOfSalesWithTransactions('batch-id');

    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
      method: 'GET',
      headers: {
        Authorization: `Bearer mocked-token`,
        Accept: 'application/json',
      },
    });
    expect(json).toHaveBeenCalled()
    expect(resolvedResult).toBe("test")
  });

  it('getMerchantPointOfSalesWithTransactions rejected', async () => {
    global.fetch = jest.fn().mockResolvedValue({ok: false});

    const MerchantApi = loadApi();

    const rejectedResult = await MerchantApi.getMerchantPointOfSalesWithTransactions('batch-id');

    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
      method: 'GET',
      headers: {
        Authorization: `Bearer mocked-token`,
        Accept: 'application/json',
      },
    });
    expect(rejectedResult).toStrictEqual([])
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

  it('getReportedUser - success', async () => {
    mockApiClient.getReportedUser.mockResolvedValue({
      _tag: 'Right',
      right: { status: 200, value: 'data' },
    });

    const MerchantApi = loadApi();

    const result = await MerchantApi.getReportedUser('initA', 'AAAAAA00A00A000A');

    expect(mockApiClient.getReportedUser).toHaveBeenCalledWith({
      'initiative-id': 'initA',
      userFiscalCode: 'AAAAAA00A00A000A',
    });
    expect(result).toBe('data');
  });

  it('getReportedUser - throws when not right', async () => {
    mockApiClient.getReportedUser.mockResolvedValue({
      _tag: 'Left',
      left: [],
    });

    const MerchantApi = loadApi();

    await expect(
      MerchantApi.getReportedUser('initA', 'AAAAAA00A00A000A')
    ).rejects.toThrow('GET_REPORTED_USER_FAILED');
  });

  it('getReportedUser - throws when status not 200', async () => {
    mockApiClient.getReportedUser.mockResolvedValue({
      _tag: 'Right',
      right: { status: 500, value: {} },
    });

    const MerchantApi = loadApi();

    await expect(
      MerchantApi.getReportedUser('initA', 'AAAAAA00A00A000A')
    ).rejects.toThrow('GET_REPORTED_USER_FAILED');
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

  it('getRewardBatches - error path logs and throws', async () => {
    const error = new Error('Boom') as any;
    error.response = { data: { errorKey: 'ERR_KEY_TEST' } };

    mockApiClient.getRewardBatches.mockRejectedValue(error);

    const MerchantApi = loadApi();

    await expect(
      MerchantApi.getRewardBatches('init1')
    ).rejects.toThrow('Boom');
  });

  it('getRewardBatches - error without errorKey', async () => {
    const error = new Error('Boom');

    mockApiClient.getRewardBatches.mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleGroupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

    const MerchantApi = loadApi();

    await expect(
      MerchantApi.getRewardBatches('init1')
    ).rejects.toThrow('Boom');

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
    expect(result).toBe('extracted');
  });

  it('sendRewardBatches - error with REWARD_BATCH_PREVIOUS_NOT_SENT', async () => {
    mockApiClient.sendRewardBatches.mockResolvedValue({
      right: { value: {code: 'REWARD_BATCH_PREVIOUS_NOT_SENT'}, status: 400 },
    });
    const MerchantApi = loadApi();

    const result = await MerchantApi.sendRewardBatches('init1', 'batch1');

    expect(result).toBe('REWARD_BATCH_PREVIOUS_NOT_SENT');
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
        right: { value: {} },
      },
      204,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('sendRewardBatches - right branch with undefined value triggers normalization', async () => {
    mockApiClient.sendRewardBatches.mockResolvedValue({
      right: { status: 204, value: undefined },
    });

    const MerchantApi = loadApi();
    const result = await MerchantApi.sendRewardBatches('init1', 'batch1');

    expect(extractResponse).toHaveBeenCalledWith(
      {
        right: { status: 204, value: {} },
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
    const error = new Error('Error message');

    mockApiClient.getRewardBatches.mockRejectedValue(error);

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

    await expect(
      MerchantApi.getRewardBatches('init1')
    ).rejects.toThrow();

    Object.defineProperty(console, 'groupCollapsed', {
      value: originalGroupCollapsed,
      configurable: true,
    });
    Object.defineProperty(console, 'groupEnd', {
      value: originalGroupEnd,
      configurable: true,
    });
  });

  it('getAllRewardBatches - success', async () => {
    mockApiClient.getRewardBatches.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getAllRewardBatches('init1');

    expect(mockApiClient.getRewardBatches).toHaveBeenCalledWith({
      initiativeId: 'init1',
      size: 1000,
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('getAllRewardBatches - error path logs and throws', async () => {
    const error = new Error('Boom') as any;
    error.response = { data: { errorKey: 'ERR_KEY_TEST' } };

    mockApiClient.getRewardBatches.mockRejectedValue(error);

    const MerchantApi = loadApi();

    await expect(
      MerchantApi.getAllRewardBatches('init1')
    ).rejects.toThrow('Boom');
  });


  it('getMerchantPointOfSalesWithTransactions calls redirectToLogin (dispatch) when response not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    const MerchantApi = loadApi();
    const result = await MerchantApi.getMerchantPointOfSalesWithTransactions('batch-id');

    expect(result).toEqual([]);
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(appStateActions.addError).toHaveBeenCalled();
  });

  it('getMerchantTransactionsProcessed no debug log', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    mockApiClient.getMerchantTransactionsProcessed.mockResolvedValue({ right: 'data' });

    const MerchantApi = loadApi();
    await MerchantApi.getMerchantTransactionsProcessed({ initiativeId: 'init1' });

    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleDebugSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  it('updateInvoiceTransaction - left branch', async () => {
    mockApiClient.updateInvoiceTransaction = jest.fn().mockResolvedValue({
      left: [
        {
          value: 'INV_ERR',
          context: [{}, { actual: { message: 'Invoice error' } }],
        },
      ],
    });

    const MerchantApi = loadApi();
    const result = await MerchantApi.updateInvoiceTransaction(
      'trx1',
      new File(['x'], 'file.pdf'),
      'pos1',
      'DOC1'
    );

    expect(result).toEqual({ code: 'INV_ERR', message: 'Invoice error' });
  });

  it('updateInvoiceTransaction - right branch', async () => {
    mockApiClient.updateInvoiceTransaction = jest.fn().mockResolvedValue({
      _tag: 'Right',
      right: { status: 204 },
    });

    const MerchantApi = loadApi();
    const result = await MerchantApi.updateInvoiceTransaction(
      'trx1',
      new File(['x'], 'file.pdf'),
      'pos1',
      'DOC1'
    );

    expect(result).toBe('extracted');
  });

  it('getMerchantReports', async () => {
    mockApiClient.getMerchantTransactionsReports = jest.fn().mockResolvedValue({
      right: 'data',
    });

    const MerchantApi = loadApi();
    const result = await MerchantApi.getMerchantReports('init1', 1, 10);

    expect(mockApiClient.getMerchantTransactionsReports).toHaveBeenCalledWith({
      initiativeId: 'init1',
      page: 1,
      size: 10,
    });
    expect(result).toBe('extracted');
  });

  it('generateMerchantReport', async () => {
    mockApiClient.generateReport = jest.fn().mockResolvedValue({ right: 'ok' });

    const MerchantApi = loadApi();
    const result = await MerchantApi.generateMerchantReport('init1', {
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
    } as any);

    expect(mockApiClient.generateReport).toHaveBeenCalledWith({
      initiativeId: 'init1',
      body: {
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
      },
    });
    expect(result).toBe('extracted');
  });

  it('downloadMerchantReport', async () => {
    mockApiClient.downloadTransactionsReport = jest.fn().mockResolvedValue({
      right: 'file',
    });

    const MerchantApi = loadApi();
    const result = await MerchantApi.downloadMerchantReport(
      'init1',
      'report1'
    );

    expect(mockApiClient.downloadTransactionsReport).toHaveBeenCalledWith({
      initiativeId: 'init1',
      reportId: 'report1',
    });
    expect(result).toBe('extracted');
  });

  describe('reversalTransactionInvoiced branches', () => {
    it('handles left branch (not isRight)', async () => {
      const { isRight } = require('fp-ts/Either');
      jest.spyOn(require('fp-ts/Either'), 'isRight').mockReturnValue(false);

      mockApiClient.reversalTransactionInvoiced = jest.fn().mockResolvedValue({
        left: [
          {
            value: 'REV_ERR',
            context: [{}, { actual: { code: 'REV_CODE', message: 'Rev error' } }],
          },
        ],
      });

      const MerchantApi = loadApi();
      const result = await MerchantApi.reversalTransactionInvoiced('trx1');

      expect(result).toEqual({ code: 'REV_CODE', message: 'Rev error' });
    });

    it('handles 400 status branch', async () => {
      jest.spyOn(require('fp-ts/Either'), 'isRight').mockReturnValue(true);

      mockApiClient.reversalTransactionInvoiced = jest.fn().mockResolvedValue({
        right: {
          status: 400,
          value: { code: '400_CODE', message: 'Bad request msg' },
        },
      });

      const MerchantApi = loadApi();
      const result = await MerchantApi.reversalTransactionInvoiced('trx1');

      expect(result).toEqual({ code: 'UNKNOWN_ERROR', message: 'Errore generico' });
    });

    it('handles success branch (204 extractResponse)', async () => {
      mockApiClient.reversalTransactionInvoiced = jest.fn().mockResolvedValue({
        _tag: 'Right',
        right: { status: 204 },
      });

      const MerchantApi = loadApi();
      const result = await MerchantApi.reversalTransactionInvoiced('trx1');

      expect(extractResponse).toHaveBeenCalledWith(
        expect.objectContaining({ right: { status: 204 } }),
        204,
        expect.any(Function)
      );
      expect(result).toBe('extracted');
    });
  });

  describe("getRewardBatchById", () => {
    it("should get batch by id", async () => {
    mockApiClient.getRewardBatchById.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getRewardBatchById('init-1', 'batch-2');

    expect(mockApiClient.getRewardBatchById).toHaveBeenCalledWith({initiativeId: "init-1", rewardBatchId: "batch-2"});
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
    })
  })
});
