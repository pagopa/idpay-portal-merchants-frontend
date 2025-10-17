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
} from '../merchantService';

jest.mock('../../api/MerchantsApiClient', () => ({
  MerchantApi: {
    getMerchantInitiativeList: jest.fn(),
    getMerchantTransactions: jest.fn(),
    getMerchantTransactionsProcessed: jest.fn(),
    getMerchantInitiativeStatistics: jest.fn(),
    getMerchantDetail: jest.fn(),
    deleteTransaction: jest.fn(),
    createTransaction: jest.fn(),
    authPaymentBarCode: jest.fn(),
    updateMerchantPointOfSales: jest.fn(),
    getMerchantPointOfSales: jest.fn(),
    getMerchantPointOfSalesById: jest.fn(),
    getMerchantPointOfSaleTransactionsProcessed: jest.fn(),
    downloadInvoiceFile: jest.fn(),
  },
}));

const mockedMerchantApi = MerchantApi as jest.Mocked<typeof MerchantApi>;

describe('downloadInvoiceFile', () => {
  test('should call MerchantApi.downloadInvoiceFile with correct params', async () => {
    const params = { transactionId: 'trx-1', pointOfSaleId: 'pos-1' };
    await downloadInvoiceFile(params.transactionId, params.pointOfSaleId);
    expect(mockedMerchantApi.downloadInvoiceFile).toHaveBeenCalledWith(
      ...Object.values(params)
    );
  });
});

describe('merchantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      await getMerchantTransactionsProcessed(
        params.initiativeId,
        params.page,
        params.fiscalCode,
        params.status
      );
      expect(mockedMerchantApi.getMerchantTransactionsProcessed).toHaveBeenCalledWith(
        ...Object.values(params)
      );
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
});
