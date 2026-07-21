import { getMerchantsApi } from '../../api/MerchantsApiClient';
import { ApiError } from '../../api/ApiError';
import {
  getMerchantInitiativeList,
  getMerchantInitiativesAvailable,
  getMerchantTransactions,
  getMerchantTransactionsProcessed,
  getMerchantInitiativeStatistics,
  getMerchantDetail,
  deleteTransaction,
  reversalTransactionInvoiced,
  createTransaction,
  authPaymentBarCode,
  updateMerchantPointOfSales,
  getMerchantPointOfSales,
  getMerchantPointOfSalesCatalog,
  getMerchantPointOfSalesById,
  getMerchantPointOfSaleTransactionsProcessed,
  downloadInvoiceFile,
  getReportedUser,
  createReportedUser,
  deleteReportedUser,
  getRewardBatches,
  sendRewardBatch,
  getRewardBatchById,
  downloadBatchCsv,
  postponeTransaction,
  getMerchantPointOfSalesWithTransactions,
  getAllRewardBatches,
  getMerchantReports,
  generateMerchantReport,
  downloadMerchantReport,
  updateInvoiceTransaction,
  updateMerchantData,
  associatePos,
  patchPointOfSaleReferent,
  putMerchantOnboardingRequest,
  excludePos,
} from '../merchantService';

jest.mock('../../api/MerchantsApiClient', () => ({
  getMerchantsApi: jest.fn(),
}));

const mockedApi = {
  getMerchantInitiativeList: jest.fn(),
  getMerchantInitiativesAvailable: jest.fn(),
  getMerchantTransactions: jest.fn(),
  getMerchantTransactionsProcessed: jest.fn(),
  getMerchantInitiativeStatistics: jest.fn(),
  getMerchantDetail: jest.fn(),
  deleteTransaction: jest.fn(),
  reversalTransactionInvoiced: jest.fn(),
  createTransaction: jest.fn(),
  authPaymentBarCode: jest.fn(),
  updateMerchantPointOfSales: jest.fn(),
  getMerchantPointOfSales: jest.fn(),
  getMerchantPointOfSalesCatalog: jest.fn(),
  getPointOfSaleInitiatives: jest.fn(),
  getMerchantPointOfSalesById: jest.fn(),
  getMerchantPointOfSaleTransactionsProcessed: jest.fn(),
  downloadInvoiceFile: jest.fn(),
  getReportedUser: jest.fn(),
  createReportedUser: jest.fn(),
  deleteReportedUser: jest.fn(),
  getRewardBatches: jest.fn(),
  sendRewardBatch: jest.fn(),
  getRewardBatchById: jest.fn(),
  downloadBatchCsv: jest.fn(),
  postponeTransaction: jest.fn(),
  getMerchantPointOfSalesWithTransactions: jest.fn(),
  getAllRewardBatches: jest.fn(),
  getMerchantReports: jest.fn(),
  generateMerchantReport: jest.fn(),
  downloadMerchantReport: jest.fn(),
  updateInvoiceTransaction: jest.fn(),
  updateMerchantData: jest.fn(),
  associatePos: jest.fn(),
  excludePos: jest.fn(),
  patchPointOfSaleReferent: jest.fn(),
  putMerchantOnboardingRequest: jest.fn(),
};

const expectUpdateMerchantPointOfSalesError = async (
  rejectedValue: unknown,
  expectedResult: Record<string, any>
) => {
  mockedApi.updateMerchantPointOfSales.mockRejectedValue(rejectedValue);

  await expect(updateMerchantPointOfSales('initiative', 'merchant', [])).resolves.toEqual(
    expectedResult
  );
};

describe('merchantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getMerchantsApi as jest.Mock).mockReturnValue(mockedApi);
  });

  test('getMerchantInitiativeList delegates correctly', async () => {
    mockedApi.getMerchantInitiativeList.mockResolvedValue([]);
    await getMerchantInitiativeList();
    expect(mockedApi.getMerchantInitiativeList).toHaveBeenCalledTimes(1);
  });

  test('getMerchantTransactions delegates correctly', async () => {
    mockedApi.getMerchantTransactions.mockResolvedValue({});
    await getMerchantTransactions('1', 0, 'CF', 'OK');
    expect(mockedApi.getMerchantTransactions).toHaveBeenCalledWith('1', 0, 'CF', 'OK');
  });

  test('getMerchantTransactionsProcessed delegates correctly', async () => {
    mockedApi.getMerchantTransactionsProcessed.mockResolvedValue({});
    await getMerchantTransactionsProcessed({ initiativeId: '1', page: 0 } as any);
    expect(mockedApi.getMerchantTransactionsProcessed).toHaveBeenCalled();
  });

  test('getMerchantInitiativeStatistics delegates correctly', async () => {
    mockedApi.getMerchantInitiativeStatistics.mockResolvedValue({});
    await getMerchantInitiativeStatistics('1');
    expect(mockedApi.getMerchantInitiativeStatistics).toHaveBeenCalledWith('1');
  });

  test('getMerchantDetail delegates correctly', async () => {
    mockedApi.getMerchantDetail.mockResolvedValue({});
    await getMerchantDetail('1');
    expect(mockedApi.getMerchantDetail).toHaveBeenCalledWith('1');
  });

  test('deleteTransaction delegates correctly', async () => {
    await deleteTransaction('trx');
    expect(mockedApi.deleteTransaction).toHaveBeenCalledWith('trx');
  });

  test('reversalTransactionInvoiced delegates correctly', async () => {
    await reversalTransactionInvoiced('trx', {} as any);
    expect(mockedApi.reversalTransactionInvoiced).toHaveBeenCalled();
  });

  test('createTransaction delegates correctly', async () => {
    await createTransaction(1000, 'acq', '1', '1234');
    expect(mockedApi.createTransaction).toHaveBeenCalled();
  });

  test('authPaymentBarCode delegates correctly', async () => {
    await authPaymentBarCode('code', 1000, 'acq');
    expect(mockedApi.authPaymentBarCode).toHaveBeenCalled();
  });

  test('updateMerchantPointOfSales delegates correctly', async () => {
    await updateMerchantPointOfSales('initiative', 'merchant', []);
    expect(mockedApi.updateMerchantPointOfSales).toHaveBeenCalledWith('initiative', 'merchant', []);
  });

  test('updateMerchantPointOfSales returns API error payload when request fails', async () => {
    await expectUpdateMerchantPointOfSalesError(
      {
        response: {
          data: {
            code: 'POINT_OF_SALE_ALREADY_REGISTERED',
            message: 'PointOfSales with the same functional key already exists',
          },
        },
      },
      {
        code: 'POINT_OF_SALE_ALREADY_REGISTERED',
        message: 'PointOfSales with the same functional key already exists',
      }
    );
  });

  test('updateMerchantPointOfSales maps ApiError details when request fails', async () => {
    await expectUpdateMerchantPointOfSalesError(
      new ApiError(
        400,
        'PointOfSales with the same functional key already exists',
        'POINT_OF_SALE_ALREADY_REGISTERED' as any,
        {
          code: 'POINT_OF_SALE_ALREADY_REGISTERED',
          message: 'PointOfSales with the same functional key already exists',
        }
      ),
      {
        code: 'POINT_OF_SALE_ALREADY_REGISTERED',
        message: 'PointOfSales with the same functional key already exists',
      }
    );
  });

  test('updateMerchantPointOfSales falls back to ApiError message when details message is missing', async () => {
    await expectUpdateMerchantPointOfSalesError(
      new ApiError(
        400,
        'PointOfSales with the same functional key already exists',
        'POINT_OF_SALE_ALREADY_REGISTERED' as any,
        {
          code: 'POINT_OF_SALE_ALREADY_REGISTERED',
        }
      ),
      {
        code: 'POINT_OF_SALE_ALREADY_REGISTERED',
        message: 'PointOfSales with the same functional key already exists',
      }
    );
  });

  test('updateMerchantPointOfSales returns empty message when ApiError has no details', async () => {
    await expectUpdateMerchantPointOfSalesError(
      new ApiError(400, '', 'POINT_OF_SALE_ALREADY_REGISTERED' as any),
      {
        code: 'POINT_OF_SALE_ALREADY_REGISTERED',
        message: '',
      }
    );
  });

  test('updateMerchantPointOfSales normalizes validation error details from ApiError', async () => {
    mockedApi.updateMerchantPointOfSales.mockRejectedValue(
      new ApiError(
        400,
        'validation failed',
        'VALIDATION_ERROR' as any,
        {
          code: 'VALIDATION_ERROR',
          details: [{ code: 'ERR_1', message: 'invalid row' }],
        } as any
      )
    );

    await expect(updateMerchantPointOfSales('initiative', 'merchant', [])).resolves.toEqual(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        message: 'validation failed',
        details: [{ code: 'ERR_1', message: 'invalid row' }],
        errors: [{ code: 'ERR_1', message: 'invalid row' }],
      })
    );
  });

  test('updateMerchantPointOfSales returns empty validation errors array when details and errors are missing', async () => {
    await expectUpdateMerchantPointOfSalesError(
      {
        response: {
          data: {
            code: 'VALIDATION_ERROR',
          },
        },
      },
      {
        code: 'VALIDATION_ERROR',
        errors: [],
      }
    );
  });

  test('updateMerchantPointOfSales preserves validation errors when already present in payload', async () => {
    await expectUpdateMerchantPointOfSalesError(
      {
        response: {
          data: {
            code: 'VALIDATION_ERROR',
            errors: [{ code: 'ERR_2', message: 'existing error' }],
          },
        },
      },
      {
        code: 'VALIDATION_ERROR',
        errors: [{ code: 'ERR_2', message: 'existing error' }],
      }
    );
  });

  test('updateMerchantPointOfSales returns response payload when only message is available', async () => {
    await expectUpdateMerchantPointOfSalesError(
      {
        response: {
          data: {
            message: 'PointOfSales with the same functional key already exists',
          },
        },
      },
      {
        message: 'PointOfSales with the same functional key already exists',
      }
    );
  });

  test('updateMerchantPointOfSales returns generic error when payload is missing', async () => {
    await expectUpdateMerchantPointOfSalesError(new Error('unexpected failure'), {
      code: 'POINT_OF_SALE_GENERIC_ERROR',
      message: '',
    });
  });

  test('getMerchantPointOfSales maps response pagination fields', async () => {
    mockedApi.getMerchantPointOfSales.mockResolvedValue({
      content: [{ id: 'pos-1' }],
      pageNumber: 2,
      pageSize: 25,
      totalElements: 120,
    });

    await expect(getMerchantPointOfSales('init-1', 'merchant', {} as any)).resolves.toEqual({
      content: [{ id: 'pos-1' }],
      pageNo: 2,
      pageSize: 25,
      totalElements: 120,
    });
    expect(mockedApi.getMerchantPointOfSales).toHaveBeenCalled();
  });

  test('getMerchantPointOfSalesCatalog maps response pagination fields', async () => {
    mockedApi.getMerchantPointOfSalesCatalog.mockResolvedValue({
      content: [{ id: 'catalog-pos-1' }],
      pageNumber: 1,
      pageSize: 10,
      totalElements: 11,
    });

    await expect(getMerchantPointOfSalesCatalog('merchant', {} as any)).resolves.toEqual({
      content: [{ id: 'catalog-pos-1' }],
      pageNo: 1,
      pageSize: 10,
      totalElements: 11,
    });
    expect(mockedApi.getMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant', {});
  });

  test('getMerchantPointOfSalesById delegates correctly', async () => {
    await getMerchantPointOfSalesById('init-1', 'merchant', 'pos');
    expect(mockedApi.getMerchantPointOfSalesById).toHaveBeenCalled();
  });

  test('getPointOfSaleInitiatives delegates correctly', async () => {
    mockedApi.getPointOfSaleInitiatives.mockResolvedValue([]);
    const { getPointOfSaleInitiatives } = require('../merchantService');

    await getPointOfSaleInitiatives('merchant', 'pos');
    expect(mockedApi.getPointOfSaleInitiatives).toHaveBeenCalledWith('merchant', 'pos');
  });

  test('associatePos delegates correctly', async () => {
    const result = {
      associated: [{ pointOfSaleId: 'pos1', franchiseName: 'Store 1' }],
      notAssociated: [],
    };
    mockedApi.associatePos.mockResolvedValue(result);

    await expect(associatePos('init-1', 'merchant', ['pos1'])).resolves.toEqual(result);
    expect(mockedApi.associatePos).toHaveBeenCalledWith('init-1', 'merchant', ['pos1']);
  });

  test('excludePos delegates correctly', async () => {
    const result = {
      excludedPointOfSales: [{ pointOfSaleId: 'pos1', franchiseName: 'Store 1' }],
      notExcludedPointOfSales: [],
    };
    mockedApi.excludePos.mockResolvedValue(result);

    await expect(excludePos('init-1', 'merchant', ['pos1'])).resolves.toEqual(result);
    expect(mockedApi.excludePos).toHaveBeenCalledWith('init-1', 'merchant', ['pos1']);
  });

  test('getMerchantPointOfSaleTransactionsProcessed delegates correctly', async () => {
    mockedApi.getMerchantPointOfSaleTransactionsProcessed.mockResolvedValue({});
    await getMerchantPointOfSaleTransactionsProcessed('1', 'pos', {} as any);
    expect(mockedApi.getMerchantPointOfSaleTransactionsProcessed).toHaveBeenCalled();
  });

  test('downloadInvoiceFile delegates correctly', async () => {
    await downloadInvoiceFile('trx', 'pos');
    expect(mockedApi.downloadInvoiceFile).toHaveBeenCalledWith('pos', 'trx');
  });

  test('getReportedUser delegates correctly', async () => {
    await getReportedUser('1', 'CF');
    expect(mockedApi.getReportedUser).toHaveBeenCalled();
  });

  test('createReportedUser delegates correctly', async () => {
    await createReportedUser('1', 'CF');
    expect(mockedApi.createReportedUser).toHaveBeenCalled();
  });

  test('deleteReportedUser delegates correctly', async () => {
    await deleteReportedUser('1', 'CF');
    expect(mockedApi.deleteReportedUser).toHaveBeenCalled();
  });

  test('getRewardBatches delegates correctly', async () => {
    await getRewardBatches('1', 0, 10);
    expect(mockedApi.getRewardBatches).toHaveBeenCalled();
  });

  test('sendRewardBatch delegates correctly', async () => {
    await sendRewardBatch('1', 'batch');
    expect(mockedApi.sendRewardBatch).toHaveBeenCalledWith('1', 'batch');
  });

  test('getRewardBatchById delegates correctly', async () => {
    await getRewardBatchById('1', 'batch');
    expect(mockedApi.getRewardBatchById).toHaveBeenCalled();
  });

  test('downloadBatchCsv delegates correctly', async () => {
    await downloadBatchCsv('1', 'batch');
    expect(mockedApi.downloadBatchCsv).toHaveBeenCalled();
  });

  test('postponeTransaction delegates correctly', async () => {
    await postponeTransaction('1', 'batch', 'trx');
    expect(mockedApi.postponeTransaction).toHaveBeenCalledWith('1', 'batch', 'trx');
  });

  test('getMerchantPointOfSalesWithTransactions delegates correctly', async () => {
    await getMerchantPointOfSalesWithTransactions('batch');
    expect(mockedApi.getMerchantPointOfSalesWithTransactions).toHaveBeenCalled();
  });

  test('getAllRewardBatches delegates correctly', async () => {
    await getAllRewardBatches('1');
    expect(mockedApi.getAllRewardBatches).toHaveBeenCalled();
  });

  test('getMerchantReports delegates correctly', async () => {
    await getMerchantReports('1', 0, 10);
    expect(mockedApi.getMerchantReports).toHaveBeenCalledWith('1', 0, 10);
  });

  test('generateMerchantReport delegates correctly', async () => {
    const reportRequest = { fromDate: '2024-01-01', toDate: '2024-01-31' } as any;
    await generateMerchantReport('1', reportRequest);
    expect(mockedApi.generateMerchantReport).toHaveBeenCalledWith('1', reportRequest);
  });

  test('downloadMerchantReport delegates correctly', async () => {
    await downloadMerchantReport('1', 'report-id');
    expect(mockedApi.downloadMerchantReport).toHaveBeenCalledWith('1', 'report-id');
  });

  test('updateInvoiceTransaction delegates correctly', async () => {
    await updateInvoiceTransaction('trx', {} as any);
    expect(mockedApi.updateInvoiceTransaction).toHaveBeenCalled();
  });

  test('updateMerchantData delegates correctly', async () => {
    const merchantData = { iban: 'IT60X0542811101000000123456' } as any;
    await updateMerchantData('1', merchantData);
    expect(mockedApi.updateMerchantData).toHaveBeenCalledWith('1', merchantData);
  });

  test('getMerchantInitiativesAvailable delegates correctly', async () => {
    mockedApi.getMerchantInitiativesAvailable.mockResolvedValue([]);
    await getMerchantInitiativesAvailable({ initiativeName: 'Test' });
    expect(mockedApi.getMerchantInitiativesAvailable).toHaveBeenCalledWith({
      initiativeName: 'Test',
    });
  });

  test('getMerchantPointOfSales returns defaults when fields are missing', async () => {
    mockedApi.getMerchantPointOfSales.mockResolvedValue({});

    await expect(getMerchantPointOfSales('init-1', 'merchant', {} as any)).resolves.toEqual({
      content: [],
      pageNo: 0,
      pageSize: 0,
      totalElements: 0,
    });
    expect(mockedApi.getMerchantPointOfSales).toHaveBeenCalled();
  });

  test('getMerchantPointOfSalesCatalog returns defaults when fields are missing', async () => {
    mockedApi.getMerchantPointOfSalesCatalog.mockResolvedValue({});

    await expect(getMerchantPointOfSalesCatalog('merchant', {} as any)).resolves.toEqual({
      content: [],
      pageNo: 0,
      pageSize: 0,
      totalElements: 0,
    });
    expect(mockedApi.getMerchantPointOfSalesCatalog).toHaveBeenCalled();
  });

  test('getMerchantPointOfSalesCatalog preserves initiativeId and initiativeFilter together', async () => {
    mockedApi.getMerchantPointOfSalesCatalog.mockResolvedValue({});

    await getMerchantPointOfSalesCatalog('merchant', {
      initiativeId: 'initiative-1',
      initiativeFilter: 'ALL_INITIATIVES',
    } as any);

    expect(mockedApi.getMerchantPointOfSalesCatalog).toHaveBeenCalledWith('merchant', {
      initiativeId: 'initiative-1',
      initiativeFilter: 'ALL_INITIATIVES',
    });
  });

  test('patchPointOfSaleReferent delegates correctly', async () => {
    const body = { referentName: 'John Doe' } as any;
    const expectedResult = { id: 'pos-1', name: 'Store 1' } as any;
    mockedApi.patchPointOfSaleReferent.mockResolvedValue(expectedResult);

    await expect(patchPointOfSaleReferent('merchant', 'pos-1', body)).resolves.toEqual(
      expectedResult
    );
    expect(mockedApi.patchPointOfSaleReferent).toHaveBeenCalledWith('merchant', 'pos-1', body);
  });

  test('putMerchantOnboardingRequest delegates correctly', async () => {
    const expectedResult = { status: 'APPROVED' } as any;
    mockedApi.putMerchantOnboardingRequest.mockResolvedValue(expectedResult);

    await expect(putMerchantOnboardingRequest('initiative-1')).resolves.toEqual(expectedResult);
    expect(mockedApi.putMerchantOnboardingRequest).toHaveBeenCalledWith('initiative-1');
  });

  test('updateMerchantPointOfSales returns error code when error code is falsy but exists in error', async () => {
    await expectUpdateMerchantPointOfSalesError(
      new ApiError(400, 'error message', undefined as any, undefined),
      {
        code: 'POINT_OF_SALE_GENERIC_ERROR',
        message: 'error message',
      }
    );
  });

  test('updateMerchantPointOfSales returns result as void when successful', async () => {
    mockedApi.updateMerchantPointOfSales.mockResolvedValue(undefined);

    const result = await updateMerchantPointOfSales('initiative', 'merchant', []);
    expect(result).toBeUndefined();
    expect(mockedApi.updateMerchantPointOfSales).toHaveBeenCalledWith('initiative', 'merchant', []);
  });
});
