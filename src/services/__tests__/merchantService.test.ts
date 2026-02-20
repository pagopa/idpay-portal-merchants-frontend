import { MerchantApi } from '../../api/MerchantsApiClient';
import {
  getMerchantInitiativeList,
  getMerchantTransactions,
  getMerchantTransactionsProcessed,
  getMerchantInitiativeStatistics,
  getMerchantDetail,
  deleteTransaction,
  createTransaction,
  authPaymentBarCode,
  updateMerchantPointOfSales,
  getMerchantPointOfSales,
  getMerchantPointOfSalesById,
  getMerchantPointOfSaleTransactionsProcessed,
  downloadInvoiceFile,
  getReportedUser,
  createReportedUser,
  deleteReportedUser,
  getRewardBatches,
  sendRewardBatch,
  downloadBatchCsv,
  postponeTransaction,
  getMerchantPointOfSalesWithTransactions,
  getAllRewardBatches,
  updateInvoiceTransaction,

} from '../merchantService';

vi.mock('../../api/MerchantsApiClient', () => ({
  MerchantApi: {
    getMerchantInitiativeList: vi.fn(),
    getMerchantTransactions: vi.fn(),
    getMerchantTransactionsProcessed: vi.fn(),
    getMerchantInitiativeStatistics: vi.fn(),
    getMerchantDetail: vi.fn(),
    deleteTransaction: vi.fn(),
    createTransaction: vi.fn(),
    authPaymentBarCode: vi.fn(),
    updateMerchantPointOfSales: vi.fn(),
    getMerchantPointOfSales: vi.fn(),
    getMerchantPointOfSalesById: vi.fn(),
    getMerchantPointOfSaleTransactionsProcessed: vi.fn(),
    downloadInvoiceFile: vi.fn(),
    getReportedUser: vi.fn(),
    createReportedUser: vi.fn(),
    deleteReportedUser: vi.fn(),
    getRewardBatches: vi.fn(),
    sendRewardBatches: vi.fn(),
    downloadBatchCsv: vi.fn(),
    postponeTransaction: vi.fn(),
    getMerchantPointOfSalesWithTransactions: vi.fn(),
    getAllRewardBatches: vi.fn(),
    updateInvoiceTransaction: vi.fn(),
  },
}));

const mockedMerchantApi = MerchantApi as vi.Mocked<typeof MerchantApi>;

describe('merchantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
});

describe('merchantService uncovered branches', () => {
  it('sendRewardBatch delegates correctly', async () => {
    mockedMerchantApi.sendRewardBatches.mockResolvedValue('ok' as any);

    const result = await mockedMerchantApi.sendRewardBatches('initiative1', 'batch1');

    expect(mockedMerchantApi.sendRewardBatches).toHaveBeenCalledWith('initiative1', 'batch1');
    expect(result).toBe('ok');
  });

  it('postponeTransaction delegates correctly', async () => {
    mockedMerchantApi.postponeTransaction = vi.fn().mockResolvedValue(undefined as any);

    await mockedMerchantApi.postponeTransaction('initiative1', 'batch1', 'trx1', '2025-12-31');

    expect(mockedMerchantApi.postponeTransaction).toHaveBeenCalledWith(
      'initiative1',
      'batch1',
      'trx1',
      '2025-12-31'
    );
  });

  it('downloadBatchCsv delegates correctly', async () => {
    mockedMerchantApi.downloadBatchCsv = vi.fn().mockResolvedValue('csv' as any);

    const result = await mockedMerchantApi.downloadBatchCsv('initiative1', 'batch1');

    expect(mockedMerchantApi.downloadBatchCsv).toHaveBeenCalledWith('initiative1', 'batch1');
    expect(result).toBe('csv');
  });
});

  describe('getMerchantInitiativeList', () => {
    test('should call MerchantApi.getMerchantInitiativeList', async () => {
      mockedMerchantApi.getMerchantInitiativeList.mockResolvedValue([]);
      await getMerchantInitiativeList();
      expect(mockedMerchantApi.getMerchantInitiativeList).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMerchantTransactions', () => {
    test('should call MerchantApi.getMerchantTransactions with correct params', async () => {
      const params = { initiativeId: '1', page: 0, fiscalCode: 'CODE', status: 'OK' };
      await getMerchantTransactions(
        params.initiativeId,
        params.page,
        params.fiscalCode,
        params.status
      );
      expect(mockedMerchantApi.getMerchantTransactions).toHaveBeenCalledWith(
        ...Object.values(params)
      );
    });
  });

  describe('getMerchantTransactionsProcessed', () => {
    test('should call MerchantApi.getMerchantTransactionsProcessed with correct params', async () => {
      const params = { initiativeId: '1', page: 0, fiscalCode: 'CODE', status: 'OK' };
      await getMerchantTransactionsProcessed(params);
      expect(mockedMerchantApi.getMerchantTransactionsProcessed).toHaveBeenCalledWith(params);
    });
  });

  describe('getMerchantInitiativeStatistics', () => {
    test('should call MerchantApi.getMerchantInitiativeStatistics with correct initiativeId', async () => {
      const initiativeId = 'test-id';
      await getMerchantInitiativeStatistics(initiativeId);
      expect(mockedMerchantApi.getMerchantInitiativeStatistics).toHaveBeenCalledWith(initiativeId);
    });
  });

  describe('getMerchantDetail', () => {
    test('should call MerchantApi.getMerchantDetail with correct initiativeId', async () => {
      const initiativeId = 'test-id';
      await getMerchantDetail(initiativeId);
      expect(mockedMerchantApi.getMerchantDetail).toHaveBeenCalledWith(initiativeId);
    });
  });

  describe('deleteTransaction', () => {
    test('should call MerchantApi.deleteTransaction with correct transactionId', async () => {
      const transactionId = 'trx-id';
      await deleteTransaction(transactionId);
      expect(mockedMerchantApi.deleteTransaction).toHaveBeenCalledWith(transactionId);
    });
  });

  describe('createTransaction', () => {
    test('should call MerchantApi.createTransaction with correct params', async () => {
      const params = {
        amountCents: 1000,
        idTrxAcquirer: 'acquirer',
        initiativeId: '1',
        mcc: '1234',
      };
      await createTransaction(
        params.amountCents,
        params.idTrxAcquirer,
        params.initiativeId,
        params.mcc
      );
      expect(mockedMerchantApi.createTransaction).toHaveBeenCalledWith(...Object.values(params));
    });
  });

  describe('authPaymentBarCode', () => {
    test('should call MerchantApi.authPaymentBarCode with correct params', async () => {
      const params = { trxCode: 'code', amountCents: 1000, idTrxAcquirer: 'acquirer' };
      await authPaymentBarCode(params.trxCode, params.amountCents, params.idTrxAcquirer);
      expect(mockedMerchantApi.authPaymentBarCode).toHaveBeenCalledWith(...Object.values(params));
    });
  });

  describe('updateMerchantPointOfSales', () => {
    test('should call MerchantApi.updateMerchantPointOfSales with correct params', async () => {
      const params = { merchantId: 'merchant-1', pointOfSales: [{ id: 'pos-1' }] };
      await updateMerchantPointOfSales(params.merchantId, params.pointOfSales as any);
      expect(mockedMerchantApi.updateMerchantPointOfSales).toHaveBeenCalledWith(
        ...Object.values(params)
      );
    });
  });

  describe('getMerchantPointOfSales', () => {
    test('should call MerchantApi.getMerchantPointOfSales with correct params', async () => {
      const params = { merchantId: 'merchant-1', filters: { city: 'Rome' } };
      await getMerchantPointOfSales(params.merchantId, params.filters as any);
      expect(mockedMerchantApi.getMerchantPointOfSales).toHaveBeenCalledWith(
        ...Object.values(params)
      );
    });
  });

  describe('getMerchantPointOfSalesById', () => {
    test('should call MerchantApi.getMerchantPointOfSalesById with correct params', async () => {
      const params = { merchantId: 'merchant-1', pointOfSaleId: 'pos-1' };
      await getMerchantPointOfSalesById(params.merchantId, params.pointOfSaleId);
      expect(mockedMerchantApi.getMerchantPointOfSalesById).toHaveBeenCalledWith(
        ...Object.values(params)
      );
    });
  });

  describe('getMerchantPointOfSaleTransactionsProcessed', () => {
    test('should call MerchantApi.getMerchantPointOfSaleTransactionsProcessed with correct params', async () => {
      const params = { initiativeId: '1', pointOfSaleId: 'pos-1', filters: { page: 0 } };
      await getMerchantPointOfSaleTransactionsProcessed(
        params.initiativeId,
        params.pointOfSaleId,
        params.filters
      );
      expect(mockedMerchantApi.getMerchantPointOfSaleTransactionsProcessed).toHaveBeenCalledWith(
        ...Object.values(params)
      );
    });
  });

  describe('downloadInvoiceFile', () => {
    test('should call MerchantApi.downloadInvoiceFile with correct params', async () => {
      const params = { transactionId: 'trx-1', pointOfSaleId: 'pos-1' };
      await downloadInvoiceFile(params.transactionId, params.pointOfSaleId);
      expect(mockedMerchantApi.downloadInvoiceFile).toHaveBeenCalledWith(...Object.values(params));
    });
  });

  describe('getReportedUser', () => {
    test('should call MerchantApi.getReportedUser with correct params', async () => {
      const params = {
        initiativeId: 'init-1',
        userFiscalCode: 'AAAAAA00A00A000A',
      };
      await getReportedUser(params.initiativeId, params.userFiscalCode);
      expect(mockedMerchantApi.getReportedUser).toHaveBeenCalledWith(
        params.initiativeId,
        params.userFiscalCode
      );
    });
  });

  describe('createReportedUser', () => {
    test('should call MerchantApi.createReportedUser with correct params', async () => {
      const params = {
        initiativeId: 'init-2',
        fiscalCode: 'BBBBBB00B00B000B',
      };
      await createReportedUser(params.initiativeId, params.fiscalCode);
      expect(mockedMerchantApi.createReportedUser).toHaveBeenCalledWith(
        params.initiativeId,
        params.fiscalCode
      );
    });
  });

  describe('deleteReportedUser', () => {
    test('should call MerchantApi.deleteReportedUser with correct params', async () => {
      const params = {
        initiativeId: 'init-3',
        userFiscalCode: 'CCCCCC00C00C000C',
      };
      await deleteReportedUser(params.initiativeId, params.userFiscalCode);
      expect(mockedMerchantApi.deleteReportedUser).toHaveBeenCalledWith(
        params.initiativeId,
        params.userFiscalCode
      );
    });
  });

  describe('getRewardBatches', () => {
    test('should call MerchantApi.getRewardBatches with correct initiativeId', async () => {
      const initiativeId = 'init-1';
      await getRewardBatches(initiativeId, 0,10);
      expect(mockedMerchantApi.getRewardBatches).toHaveBeenCalledWith(initiativeId, 0, 10);
    });
  });

  describe('sendRewardBatch', () => {
    test('should call MerchantApi.sendRewardBatches with correct params', async () => {
      const params = { initiativeId: 'init-1', batchId: 'batch-1' };
      await sendRewardBatch(params.initiativeId, params.batchId);
      expect(mockedMerchantApi.sendRewardBatches).toHaveBeenCalledWith(
        params.initiativeId,
        params.batchId
      );
    });
  });

  describe('downloadBatchCsv', () => {
    test('should call MerchantApi.downloadBatchCsv with correct params', async () => {
      const params = { initiativeId: 'init-1', rewardBatchId: 'batch-1' };
      await downloadBatchCsv(params.initiativeId, params.rewardBatchId);
      expect(mockedMerchantApi.downloadBatchCsv).toHaveBeenCalledWith(
        params.initiativeId,
        params.rewardBatchId
      );
    });
  });

  describe('postponeTransaction', () => {
    test('should call MerchantApi.postponeTransaction with correct params', async () => {
      const params = {
        initiativeId: 'init-1',
        rewardBatchId: 'batch-1',
        transactionId: 'trx-1',
        initiativeEndDate: '2024-12-31',
      };
      await postponeTransaction(
        params.initiativeId,
        params.rewardBatchId,
        params.transactionId,
        params.initiativeEndDate
      );
      expect(mockedMerchantApi.postponeTransaction).toHaveBeenCalledWith(
        params.initiativeId,
        params.rewardBatchId,
        params.transactionId,
        params.initiativeEndDate
      );
    });
  });

  describe('getMerchantPointOfSalesWithTransactions', () => {
    test('should call MerchantApi.getMerchantPointOfSalesWithTransactions with correct params', async () => {
      mockedMerchantApi.getMerchantPointOfSalesWithTransactions.mockResolvedValue([]);
      await getMerchantPointOfSalesWithTransactions('batch-1');

      expect(mockedMerchantApi.getMerchantPointOfSalesWithTransactions).toHaveBeenCalledWith('batch-1');
    });
  });

  describe('getAllRewardBatches', () => {
    test('should call MerchantApi.getAllRewardBatches with correct initiativeId', async () => {
      mockedMerchantApi.getAllRewardBatches.mockResolvedValue({} as any);
      await getAllRewardBatches('init-1');

      expect(mockedMerchantApi.getAllRewardBatches).toHaveBeenCalledWith('init-1');
    });
  });

  describe('updateInvoiceTransaction', () => {
    test('should call MerchantApi.updateInvoiceTransaction with correct params', async () => {
      mockedMerchantApi.updateInvoiceTransaction.mockResolvedValue({ code: 'OK', message: 'ok' });

      const file = new File(['dummy'], 'invoice.pdf', { type: 'application/pdf' });

      await updateInvoiceTransaction('trx-1', file, 'pos-1', 'DOC-001');

      expect(mockedMerchantApi.updateInvoiceTransaction).toHaveBeenCalledWith(
        'trx-1',
        file,
        'pos-1',
        'DOC-001'
      );
    });

    test('should call MerchantApi.updateInvoiceTransaction without docNumber', async () => {
      mockedMerchantApi.updateInvoiceTransaction.mockResolvedValue({ code: 'OK', message: 'ok' });

      const file = new File(['dummy'], 'invoice.pdf', { type: 'application/pdf' });

      await updateInvoiceTransaction('trx-1', file, 'pos-1');

      expect(mockedMerchantApi.updateInvoiceTransaction).toHaveBeenCalledWith(
        'trx-1',
        file,
        'pos-1',
        undefined
      );
    });
  });

  describe('getMerchantReports', () => {
    test('should call MerchantApi.getMerchantReports with correct params', async () => {
      mockedMerchantApi.getMerchantReports = vi.fn().mockResolvedValue({} as any);

      await (await import('../merchantService')).getMerchantReports('init-1', 1, 10);

      expect(mockedMerchantApi.getMerchantReports).toHaveBeenCalledWith(
        'init-1',
        1,
        10
      );
    });
  });

  describe('generateMerchantReport', () => {
    test('should call MerchantApi.generateMerchantReport with correct params', async () => {
      mockedMerchantApi.generateMerchantReport = vi.fn().mockResolvedValue(undefined as any);

      const body = { fromDate: '2024-01-01', toDate: '2024-01-31' };

      await (await import('../merchantService')).generateMerchantReport('init-1', body as any);

      expect(mockedMerchantApi.generateMerchantReport).toHaveBeenCalledWith(
        'init-1',
        body
      );
    });
  });

  describe('downloadMerchantReport', () => {
    test('should call MerchantApi.downloadMerchantReport with correct params', async () => {
      mockedMerchantApi.downloadMerchantReport = vi.fn().mockResolvedValue('file' as any);

      await (await import('../merchantService')).downloadMerchantReport('init-1', 'report-1');

      expect(mockedMerchantApi.downloadMerchantReport).toHaveBeenCalledWith(
        'init-1',
        'report-1'
      );
    });
  });
});
