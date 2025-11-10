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

  it('getMerchantTransactionsProcessed', async () => {
    mockApiClient.getMerchantTransactionsProcessed.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantTransactionsProcessed('init1', 1);

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

  it('authPaymentBarCode', async () => {
    mockApiClient.authPaymentBarCode.mockResolvedValue('ok');
    const MerchantApi = loadApi();

    const result = await MerchantApi.authPaymentBarCode('trxCode', 200, 'trx1');

    expect(mockApiClient.authPaymentBarCode).toHaveBeenCalledWith({
      trxCode: 'trxCode',
      body: { amountCents: 200, idTrxAcquirer: 'trx1' },
    });
    expect(result).toBe('ok');
  });

  it('updateMerchantPointOfSales returns error object when left', async () => {
    mockApiClient.putPointOfSales.mockResolvedValue({
      left: [{ value: 'ERR_CODE', context: [{}, { actual: { message: 'Error msg' } }] }],
    });
    const MerchantApi = loadApi();

    const result = await MerchantApi.updateMerchantPointOfSales('m1', []);

    expect(result).toEqual({ code: 'ERR_CODE', message: 'Error msg' });
  });

  it('updateMerchantPointOfSales calls extractResponse when right', async () => {
    /*
    (response: t.Validation<TypeofApiResponse<ApiRequestType<any, any, any, IResponseType<any, any, any>>>>, 
      successHttpStatus: number, 
      onRedirectToLogin: () => void, 
      notValidTokenHttpStatus?: number | null, 
      notAuthorizedTokenHttpStatus?: number | null, 
      emptyResponseHttpStatus?: number | null)
      */

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
    // @ts-ignore
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
    expect(extractResponse).not.toHaveBeenCalled();
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

  it('getMerchantTransactionsProcessed with filters', async () => {
    mockApiClient.getMerchantTransactionsProcessed.mockResolvedValue({ right: 'data' });
    const MerchantApi = loadApi();

    const result = await MerchantApi.getMerchantTransactionsProcessed(
      'init-filter',
      3,
      'DDD',
      'OK'
    );

    expect(mockApiClient.getMerchantTransactionsProcessed).toHaveBeenCalledWith({
      initiativeId: 'init-filter',
      page: 3,
      size: 10,
      fiscalCode: 'DDD',
      status: 'OK',
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });
});
