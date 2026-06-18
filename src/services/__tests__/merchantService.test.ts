/// <reference types="jest" />

import { getMerchantsApi } from '../../api/MerchantsApiClient';
import {
  getMerchantInitiativeList,
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
} from '../merchantService';

jest.mock('../../api/MerchantsApiClient', () => ({
  getMerchantsApi: jest.fn(),
}));

const mockedApi = {
  getMerchantInitiativeList: jest.fn(),
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

  test('getMerchantPointOfSales delegates correctly', async () => {
    mockedApi.getMerchantPointOfSales.mockResolvedValue({});
    await getMerchantPointOfSales('merchant', {} as any);
    expect(mockedApi.getMerchantPointOfSales).toHaveBeenCalled();
  });

  test('getMerchantPointOfSalesById delegates correctly', async () => {
    await getMerchantPointOfSalesById('merchant', 'pos');
    expect(mockedApi.getMerchantPointOfSalesById).toHaveBeenCalled();
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
});
