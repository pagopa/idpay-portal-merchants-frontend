/// <reference types="jest" />

var mockMerchantInitiativesInstance: any;

jest.mock('../generated/merchants/MerchantInitiatives', () => ({
  MerchantInitiatives: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantInitiativeList = jest.fn();
    mockMerchantInitiativesInstance = this;
  }),
}));

jest.mock('../generated/merchants/MerchantInitiativeStatistics', () => ({
  MerchantInitiativeStatistics: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantInitiativeStatistics = jest.fn();
  }),
}));

jest.mock('../generated/merchants/MerchantDetail', () => ({
  MerchantDetail: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantDetail = jest.fn();
    this.updateMerchantIban = jest.fn();
  }),
}));

jest.mock('../generated/merchants/MerchantTransactions', () => ({
  MerchantTransactions: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantTransactions = jest.fn();
    this.getMerchantTransactionsProcessed = jest.fn();
  }),
}));

jest.mock('../generated/merchants/Transaction', () => ({
  Transaction: jest.fn().mockImplementation(function (this: any) {
    this.reversalTransactionInvoiced = jest.fn();
    this.updateInvoiceTransaction = jest.fn();
    this.downloadInvoiceFile = jest.fn();
    this.getFranchisePointOfSale = jest.fn();
  }),
}));

jest.mock('../generated/merchants/RewardBatches', () => ({
  RewardBatches: jest.fn().mockImplementation(function (this: any) {
    this.getRewardBatches = jest.fn();
    this.getRewardBatchById = jest.fn();
    this.sendRewardBatches = jest.fn();
    this.approveDownloadRewardBatch = jest.fn();
    this.postponeTransaction = jest.fn();
  }),
}));

jest.mock('../generated/merchants/PointOfSales', () => ({
  PointOfSales: jest.fn().mockImplementation(function (this: any) {
    this.putPointOfSales = jest.fn();
    this.getPointOfSales = jest.fn();
    this.getPointOfSale = jest.fn();
  }),
}));

jest.mock('../generated/merchants/PointOfSaleTransactions', () => ({
  PointOfSaleTransactions: jest.fn().mockImplementation(function (this: any) {
    this.getPointOfSaleTransactionsProcessed = jest.fn();
  }),
}));

jest.mock('../generated/merchants/MerchantReport', () => ({
  MerchantReport: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantTransactionsReports = jest.fn();
    this.generateReport = jest.fn();
    this.downloadTransactionsReport = jest.fn();
  }),
}));

jest.mock('../generated/merchants/ReportedUser', () => ({
  ReportedUser: jest.fn().mockImplementation(function (this: any) {
    this.getReportedUser = jest.fn();
    this.createReportedUser = jest.fn();
    this.deleteReportedUser = jest.fn();
  }),
}));

import { getMerchantsApi } from '../MerchantsApiClient';

describe('MerchantsApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createTransaction returns response data', async () => {
    const api = getMerchantsApi();

    const result = await api.createTransaction({
      amountCents: 100,
      idTrxAcquirer: 'trx1',
      initiativeId: 'init1',
    });

    expect(result).toEqual({});
  });

  it('deleteTransaction resolves without error', async () => {
    const api = getMerchantsApi();

    await expect(api.deleteTransaction('trx1')).resolves.toBeUndefined();
  });
});
