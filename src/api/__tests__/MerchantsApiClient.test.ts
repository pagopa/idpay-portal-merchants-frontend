let mockMerchantInitiativesInstance: any;
let mockMerchantInitiativesOnboardingInstance: any;
let mockMerchantStatisticsInstance: any;
let mockMerchantDetailInstance: any;
let mockMerchantTransactionsInstance: any;
let mockTransactionInstance: any;
let mockRewardBatchesInstance: any;
let mockPointOfSalesInstance: any;
let mockPointOfSaleTransactionsInstance: any;
let mockMerchantReportInstance: any;
let mockReportedUserInstance: any;

jest.mock('../generated/merchants/MerchantInitiatives', () => ({
  MerchantInitiatives: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantInitiativeList = jest.fn();
    this.getMerchantInitiativesAvailable = jest.fn();
    mockMerchantInitiativesInstance = this;
  }),
}));

jest.mock('../generated/merchants/MerchantInitiativesOnboarding', () => ({
  MerchantInitiativesOnboarding: jest.fn().mockImplementation(function (this: any) {
    this.putMerchantOnboardingRequest = jest.fn();
    mockMerchantInitiativesOnboardingInstance = this;
  }),
}));

jest.mock('../generated/merchants/MerchantInitiativeStatistics', () => ({
  MerchantInitiativeStatistics: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantInitiativeStatistics = jest.fn();
    mockMerchantStatisticsInstance = this;
  }),
}));

jest.mock('../generated/merchants/MerchantDetail', () => ({
  MerchantDetail: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantDetail = jest.fn();
    this.updateMerchantIban = jest.fn();
    mockMerchantDetailInstance = this;
  }),
}));

jest.mock('../generated/merchants/MerchantTransactions', () => ({
  MerchantTransactions: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantTransactions = jest.fn();
    this.getMerchantTransactionsProcessed = jest.fn();
    mockMerchantTransactionsInstance = this;
  }),
}));

jest.mock('../generated/merchants/Transaction', () => ({
  Transaction: jest.fn().mockImplementation(function (this: any) {
    this.reversalTransactionInvoiced = jest.fn();
    this.updateInvoiceTransaction = jest.fn();
    this.downloadInvoiceFile = jest.fn();
    this.getFranchisePointOfSale = jest.fn();
    mockTransactionInstance = this;
  }),
}));

jest.mock('../generated/merchants/RewardBatches', () => ({
  RewardBatches: jest.fn().mockImplementation(function (this: any) {
    this.getRewardBatches = jest.fn();
    this.getRewardBatchById = jest.fn();
    this.sendRewardBatches = jest.fn();
    this.approveDownloadRewardBatch = jest.fn();
    this.postponeTransaction = jest.fn();
    mockRewardBatchesInstance = this;
  }),
}));

jest.mock('../generated/merchants/PointOfSales', () => ({
  PointOfSales: jest.fn().mockImplementation(function (this: any) {
    this.postPointOfSales = jest.fn();
    this.getPointOfSalesByInitiative = jest.fn();
    this.getPointOfSales = jest.fn();
    this.getPointOfSaleInitiatives = jest.fn();
    this.getPointOfSaleByInitiative = jest.fn();
    this.pointOfSalesOnboarding = jest.fn();
    this.patchPointOfSaleReferent = jest.fn();
    mockPointOfSalesInstance = this;
  }),
}));

jest.mock('../generated/merchants/PointOfSaleTransactions', () => ({
  PointOfSaleTransactions: jest.fn().mockImplementation(function (this: any) {
    this.getPointOfSaleTransactionsProcessed = jest.fn();
    mockPointOfSaleTransactionsInstance = this;
  }),
}));

jest.mock('../generated/merchants/MerchantReport', () => ({
  MerchantReport: jest.fn().mockImplementation(function (this: any) {
    this.getMerchantTransactionsReports = jest.fn();
    this.generateReport = jest.fn();
    this.downloadTransactionsReport = jest.fn();
    mockMerchantReportInstance = this;
  }),
}));

jest.mock('../generated/merchants/ReportedUser', () => ({
  ReportedUser: jest.fn().mockImplementation(function (this: any) {
    this.getReportedUser = jest.fn();
    this.createReportedUser = jest.fn();
    this.deleteReportedUser = jest.fn();
    mockReportedUserInstance = this;
  }),
}));

import { getMerchantsApi } from '../MerchantsApiClient';

describe('MerchantsApiClient', () => {
  let api: ReturnType<typeof getMerchantsApi>;

  beforeAll(() => {
    api = getMerchantsApi();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getMerchantsApi returns a singleton instance', () => {
    const api1 = getMerchantsApi();
    const api2 = getMerchantsApi();
    expect(api1).toBe(api2);
  });

   it('getMerchantInitiativeList returns data', async () => {
     const mockData = [{ initiativeId: 'init1' }];
     mockMerchantInitiativesInstance.getMerchantInitiativeList.mockResolvedValue({
       data: mockData,
     });

     const result = await api.getMerchantInitiativeList();

     expect(result).toEqual(mockData);
     expect(mockMerchantInitiativesInstance.getMerchantInitiativeList).toHaveBeenCalled();
   });

   it('getMerchantInitiativesAvailable returns data with query params', async () => {
     const mockData = [{ initiativeId: 'init1', name: 'Initiative 1' }];
     mockMerchantInitiativesInstance.getMerchantInitiativesAvailable.mockResolvedValue({
       data: mockData,
     });

     const result = await api.getMerchantInitiativesAvailable({ page: 0, size: 10 });

     expect(result).toEqual(mockData);
     expect(mockMerchantInitiativesInstance.getMerchantInitiativesAvailable).toHaveBeenCalledWith({
       page: 0,
       size: 10,
     });
   });

   it('getMerchantInitiativesAvailable works without query params', async () => {
     const mockData = [{ initiativeId: 'init1', name: 'Initiative 1' }];
     mockMerchantInitiativesInstance.getMerchantInitiativesAvailable.mockResolvedValue({
       data: mockData,
     });

     const result = await api.getMerchantInitiativesAvailable();

     expect(result).toEqual(mockData);
     expect(mockMerchantInitiativesInstance.getMerchantInitiativesAvailable).toHaveBeenCalledWith({});
   });

  it('getMerchantInitiativeStatistics returns data', async () => {
    const mockData = { totalAmount: 100 };
    mockMerchantStatisticsInstance.getMerchantInitiativeStatistics.mockResolvedValue({
      data: mockData,
    });

    const result = await api.getMerchantInitiativeStatistics('init1');

    expect(result).toEqual(mockData);
    expect(mockMerchantStatisticsInstance.getMerchantInitiativeStatistics).toHaveBeenCalledWith({
      initiativeId: 'init1',
    });
  });

  it('getMerchantDetail returns data', async () => {
    const mockData = { merchantId: 'merch1' };
    mockMerchantDetailInstance.getMerchantDetail.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantDetail('init1');

    expect(result).toEqual(mockData);
    expect(mockMerchantDetailInstance.getMerchantDetail).toHaveBeenCalledWith({
      initiativeId: 'init1',
    });
  });

  it('updateMerchantIban returns data', async () => {
    const mockData = { merchantId: 'merch1', iban: 'IT12345' };
    const body = { iban: 'IT12345' };
    mockMerchantDetailInstance.updateMerchantIban.mockResolvedValue({ data: mockData });

    const result = await api.updateMerchantIban('init1', body as any);

    expect(result).toEqual(mockData);
    expect(mockMerchantDetailInstance.updateMerchantIban).toHaveBeenCalledWith(
      { initiativeId: 'init1' },
      body
    );
  });

  it('getMerchantTransactions returns data', async () => {
    const mockData = { content: [] };
    mockMerchantTransactionsInstance.getMerchantTransactions.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantTransactions('init1', 0, 'ABCDE', 'AUTHORIZED', 10);

    expect(result).toEqual(mockData);
    expect(mockMerchantTransactionsInstance.getMerchantTransactions).toHaveBeenCalledWith({
      initiativeId: 'init1',
      page: 0,
      size: 10,
      fiscalCode: 'ABCDE',
      status: 'AUTHORIZED',
    });
  });

  it('getMerchantTransactionsProcessed returns data', async () => {
    const mockData = { content: [] };
    mockMerchantTransactionsInstance.getMerchantTransactionsProcessed.mockResolvedValue({
      data: mockData,
    });

    const result = await api.getMerchantTransactionsProcessed('init1', { page: 0 });

    expect(result).toEqual(mockData);
    expect(mockMerchantTransactionsInstance.getMerchantTransactionsProcessed).toHaveBeenCalledWith({
      initiativeId: 'init1',
      page: 0,
    });
  });

  it('getMerchantTransactionsProcessed works without query', async () => {
    const mockData = { content: [] };
    mockMerchantTransactionsInstance.getMerchantTransactionsProcessed.mockResolvedValue({
      data: mockData,
    });

    const result = await api.getMerchantTransactionsProcessed('init1');

    expect(result).toEqual(mockData);
  });

  it('deleteTransaction resolves without error', async () => {
    await expect(api.deleteTransaction('trx1')).resolves.toBeUndefined();
  });

  it('createTransaction returns empty response', async () => {
    const result = await api.createTransaction({
      amountCents: 100,
      idTrxAcquirer: 'trx1',
      initiativeId: 'init1',
    });
    expect(result).toEqual({});
  });

  it('authPaymentBarCode returns empty object', async () => {
    const result = await api.authPaymentBarCode('trxCode', {
      amountCents: 100,
      idTrxAcquirer: 'trx1',
    });
    expect(result).toEqual({});
  });

  it('reversalTransactionInvoiced calls transaction method', async () => {
    mockTransactionInstance.reversalTransactionInvoiced.mockResolvedValue({});
    const file = new File(['content'], 'invoice.pdf');

    await api.reversalTransactionInvoiced('trx1', file, 'DOC001');

    expect(mockTransactionInstance.reversalTransactionInvoiced).toHaveBeenCalledWith(
      { transactionId: 'trx1' },
      { file, docNumber: 'DOC001' }
    );
  });

  it('updateInvoiceTransaction calls transaction method', async () => {
    mockTransactionInstance.updateInvoiceTransaction.mockResolvedValue({});
    const file = new File(['content'], 'invoice.pdf');

    await api.updateInvoiceTransaction('trx1', file, 'DOC001');

    expect(mockTransactionInstance.updateInvoiceTransaction).toHaveBeenCalledWith(
      { transactionId: 'trx1' },
      { file, docNumber: 'DOC001' }
    );
  });

  it('downloadInvoiceFile returns data', async () => {
    const mockData = { downloadUrl: 'http://example.com/invoice.pdf' };
    mockTransactionInstance.downloadInvoiceFile.mockResolvedValue({ data: mockData });

    const result = await api.downloadInvoiceFile('pos1', 'trx1');

    expect(result).toEqual(mockData);
    expect(mockTransactionInstance.downloadInvoiceFile).toHaveBeenCalledWith({
      pointOfSaleId: 'pos1',
      transactionId: 'trx1',
    });
  });

  it('updateMerchantPointOfSales calls pointOfSales method', async () => {
    mockPointOfSalesInstance.postPointOfSales.mockResolvedValue({});
    const pointOfSales = [{ pointOfSaleId: 'pos1' }];

    await api.updateMerchantPointOfSales('init1', 'merch1', pointOfSales as any);

    expect(mockPointOfSalesInstance.postPointOfSales).toHaveBeenCalledWith(
      { initiativeId: 'init1', merchantId: 'merch1' },
      pointOfSales
    );
  });

  it('getMerchantPointOfSales returns data', async () => {
    const mockData = { content: [] };
    mockPointOfSalesInstance.getPointOfSalesByInitiative.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantPointOfSales('init-1', 'merch1', { page: 0 });

    expect(result).toEqual(mockData);
    expect(mockPointOfSalesInstance.getPointOfSalesByInitiative).toHaveBeenCalledWith({
      initiativeId: 'init-1',
      merchantId: 'merch1',
      page: 0,
    });
  });

  it('getMerchantPointOfSales works without query', async () => {
    const mockData = { content: [] };
    mockPointOfSalesInstance.getPointOfSalesByInitiative.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantPointOfSales('init-1', 'merch1');

    expect(result).toEqual(mockData);
  });

  it('getMerchantPointOfSalesCatalog returns data and forwards query params', async () => {
    const mockData = { content: [{ pointOfSaleId: 'pos1' }] };
    mockPointOfSalesInstance.getPointOfSales.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantPointOfSalesCatalog('merch1', { page: 2, size: 20 });

    expect(result).toEqual(mockData);
    expect(mockPointOfSalesInstance.getPointOfSales).toHaveBeenCalledWith({
      merchantId: 'merch1',
      page: 2,
      size: 20,
    });
  });

  it('getMerchantPointOfSalesCatalog works without query', async () => {
    const mockData = { content: [] };
    mockPointOfSalesInstance.getPointOfSales.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantPointOfSalesCatalog('merch1');

    expect(result).toEqual(mockData);
    expect(mockPointOfSalesInstance.getPointOfSales).toHaveBeenCalledWith({
      merchantId: 'merch1',
    });
  });

  it('getPointOfSaleInitiatives returns initiatives array or empty array when missing', async () => {
    const mockData = { initiatives: [{ initiativeId: 'init-1' }] };
    mockPointOfSalesInstance.getPointOfSaleInitiatives.mockResolvedValueOnce({ data: mockData });
    mockPointOfSalesInstance.getPointOfSaleInitiatives.mockResolvedValueOnce({ data: {} });

    const result = await api.getPointOfSaleInitiatives('merch1', 'pos1');
    const emptyResult = await api.getPointOfSaleInitiatives('merch1', 'pos2');

    expect(result).toEqual(mockData.initiatives);
    expect(emptyResult).toEqual([]);
    expect(mockPointOfSalesInstance.getPointOfSaleInitiatives).toHaveBeenNthCalledWith(1, {
      merchantId: 'merch1',
      pointOfSaleId: 'pos1',
    });
    expect(mockPointOfSalesInstance.getPointOfSaleInitiatives).toHaveBeenNthCalledWith(2, {
      merchantId: 'merch1',
      pointOfSaleId: 'pos2',
    });
  });

  it('associatePos returns data and forwards onboarding body', async () => {
    const mockData = {
      associated: [{ pointOfSaleId: 'pos1', pointOfSaleName: 'Store 1' }],
      notAssociated: [],
    };
    mockPointOfSalesInstance.pointOfSalesOnboarding.mockResolvedValue({ data: mockData });

    const result = await api.associatePos('init-1', 'merch1', ['pos1', 'pos2']);

    expect(result).toEqual(mockData);
    expect(mockPointOfSalesInstance.pointOfSalesOnboarding).toHaveBeenCalledWith(
      {
        merchantId: 'merch1',
        initiativeId: 'init-1',
      },
      ['pos1', 'pos2']
    );
  });

  it('getMerchantPointOfSalesById returns data', async () => {
    const mockData = { pointOfSaleId: 'pos1' };
    mockPointOfSalesInstance.getPointOfSaleByInitiative.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantPointOfSalesById('init-1', 'merch1', 'pos1');

    expect(result).toEqual(mockData);
    expect(mockPointOfSalesInstance.getPointOfSaleByInitiative).toHaveBeenCalledWith({
      initiativeId: 'init-1',
      merchantId: 'merch1',
      pointOfSaleId: 'pos1',
    });
  });

  it('getMerchantPointOfSaleTransactionsProcessed returns data', async () => {
    const mockData = { content: [] };
    mockPointOfSaleTransactionsInstance.getPointOfSaleTransactionsProcessed.mockResolvedValue({
      data: mockData,
    });

    const result = await api.getMerchantPointOfSaleTransactionsProcessed('init1', 'pos1', {
      page: 0,
    });

    expect(result).toEqual(mockData);
    expect(
      mockPointOfSaleTransactionsInstance.getPointOfSaleTransactionsProcessed
    ).toHaveBeenCalledWith({
      initiativeId: 'init1',
      pointOfSaleId: 'pos1',
      page: 0,
    });
  });

  it('getMerchantPointOfSaleTransactionsProcessed works without query', async () => {
    const mockData = { content: [] };
    mockPointOfSaleTransactionsInstance.getPointOfSaleTransactionsProcessed.mockResolvedValue({
      data: mockData,
    });

    const result = await api.getMerchantPointOfSaleTransactionsProcessed('init1', 'pos1');

    expect(result).toEqual(mockData);
  });

  it('getMerchantPointOfSalesWithTransactions returns data', async () => {
    const mockData = { pointOfSales: [] };
    mockTransactionInstance.getFranchisePointOfSale.mockResolvedValue({ data: mockData });

    const result = await api.getMerchantPointOfSalesWithTransactions('batch1');

    expect(result).toEqual(mockData);
    expect(mockTransactionInstance.getFranchisePointOfSale).toHaveBeenCalledWith({
      rewardBatchId: 'batch1',
    });
  });

  it('getRewardBatches returns data', async () => {
    const mockData = { content: [] };
    mockRewardBatchesInstance.getRewardBatches.mockResolvedValue({ data: mockData });

    const result = await api.getRewardBatches('init1', 0, 10);

    expect(result).toEqual(mockData);
    expect(mockRewardBatchesInstance.getRewardBatches).toHaveBeenCalledWith({
      initiativeId: 'init1',
      page: 0,
      size: 10,
    });
  });

  it('getAllRewardBatches returns data', async () => {
    const mockData = { content: [] };
    mockRewardBatchesInstance.getRewardBatches.mockResolvedValue({ data: mockData });

    const result = await api.getAllRewardBatches('init1');

    expect(result).toEqual(mockData);
  });

  it('getRewardBatchById returns data', async () => {
    const mockData = { rewardBatchId: 'batch1' };
    mockRewardBatchesInstance.getRewardBatchById.mockResolvedValue({ data: mockData });

    const result = await api.getRewardBatchById('init1', 'batch1');

    expect(result).toEqual(mockData);
    expect(mockRewardBatchesInstance.getRewardBatchById).toHaveBeenCalledWith({
      initiativeId: 'init1',
      rewardBatchId: 'batch1',
    });
  });

  it('sendRewardBatch calls rewardBatches method', async () => {
    mockRewardBatchesInstance.sendRewardBatches.mockResolvedValue({});

    await api.sendRewardBatch('init1', 'batch1');

    expect(mockRewardBatchesInstance.sendRewardBatches).toHaveBeenCalledWith({
      initiativeId: 'init1',
      batchId: 'batch1',
    });
  });

  it('downloadBatchCsv returns data', async () => {
    const mockData = { downloadUrl: 'http://example.com/batch.csv' };
    mockRewardBatchesInstance.approveDownloadRewardBatch.mockResolvedValue({ data: mockData });

    const result = await api.downloadBatchCsv('init1', 'batch1');

    expect(result).toEqual(mockData);
    expect(mockRewardBatchesInstance.approveDownloadRewardBatch).toHaveBeenCalledWith(
      {
        initiativeId: 'init1',
        rewardBatchId: 'batch1',
      },
      { format: 'json' }
    );
  });

  it('postponeTransaction calls rewardBatches method', async () => {
    mockRewardBatchesInstance.postponeTransaction.mockResolvedValue({});

    await api.postponeTransaction('init1', 'batch1', 'trx1');

    expect(mockRewardBatchesInstance.postponeTransaction).toHaveBeenCalledWith({
      initiativeId: 'init1',
      rewardBatchId: 'batch1',
      transactionId: 'trx1',
    });
  });

  it('getMerchantReports returns data when data is present', async () => {
    const mockData = {
      content: [],
      page: { pageNumber: 0, pageSize: 10, totalElements: 0 },
    };
    mockMerchantReportInstance.getMerchantTransactionsReports.mockResolvedValue({
      data: mockData,
    });

    const result = await api.getMerchantReports('init1', 0, 10);

    expect(result).toEqual(mockData);
    expect(mockMerchantReportInstance.getMerchantTransactionsReports).toHaveBeenCalledWith(
      { initiativeId: 'init1', page: 0, size: 10 },
      { format: 'json' }
    );
  });

  it('getMerchantReports returns EMPTY_REPORT when data is null', async () => {
    mockMerchantReportInstance.getMerchantTransactionsReports.mockResolvedValue({ data: null });

    const result = await api.getMerchantReports('init1');

    expect(result).toEqual({
      content: [],
      page: { pageNumber: 0, pageSize: 0, totalElements: 0 },
    });
  });

  it('generateMerchantReport returns data', async () => {
    const mockData = { reportId: 'report1' };
    const body = { startDate: '2024-01-01', endDate: '2024-01-31' };
    mockMerchantReportInstance.generateReport.mockResolvedValue({ data: mockData });

    const result = await api.generateMerchantReport('init1', body as any);

    expect(result).toEqual(mockData);
    expect(mockMerchantReportInstance.generateReport).toHaveBeenCalledWith(
      { initiativeId: 'init1' },
      body,
      { format: 'json' }
    );
  });

  it('downloadMerchantReport returns data', async () => {
    const mockData = { downloadUrl: 'http://example.com/report.csv' };
    mockMerchantReportInstance.downloadTransactionsReport.mockResolvedValue({ data: mockData });

    const result = await api.downloadMerchantReport('init1', 'report1');

    expect(result).toEqual(mockData);
    expect(mockMerchantReportInstance.downloadTransactionsReport).toHaveBeenCalledWith(
      { initiativeId: 'init1', reportId: 'report1' },
      { format: 'json' }
    );
  });

  it('getReportedUser returns data', async () => {
    const mockData = [{ userFiscalCode: 'ABCDEF12G34H567I' }];
    mockReportedUserInstance.getReportedUser.mockResolvedValue({ data: mockData });

    const result = await api.getReportedUser('init1', 'ABCDEF12G34H567I');

    expect(result).toEqual(mockData);
    expect(mockReportedUserInstance.getReportedUser).toHaveBeenCalledWith(
      { initiativeId: 'init1', userFiscalCode: 'ABCDEF12G34H567I' },
      { headers: { 'initiative-id': 'init1' } }
    );
  });

  it('createReportedUser returns data', async () => {
    const mockData = { id: 'reported1' };
    mockReportedUserInstance.createReportedUser.mockResolvedValue({ data: mockData });

    const result = await api.createReportedUser('init1', 'ABCDEF12G34H567I');

    expect(result).toEqual(mockData);
    expect(mockReportedUserInstance.createReportedUser).toHaveBeenCalledWith(
      { initiativeId: 'init1', userFiscalCode: 'ABCDEF12G34H567I' },
      { headers: { 'initiative-id': 'init1' } }
    );
  });

  it('deleteReportedUser returns data', async () => {
    const mockData = { id: 'reported1' };
    mockReportedUserInstance.deleteReportedUser.mockResolvedValue({ data: mockData });

    const result = await api.deleteReportedUser('init1', 'ABCDEF12G34H567I');

    expect(result).toEqual(mockData);
    expect(mockReportedUserInstance.deleteReportedUser).toHaveBeenCalledWith(
      { initiativeId: 'init1', userFiscalCode: 'ABCDEF12G34H567I' },
      { headers: { 'initiative-id': 'init1' } }
    );
  });

  it('updateMerchantData calls updateMerchantIban with the provided data', async () => {
    mockMerchantDetailInstance.updateMerchantIban.mockResolvedValue({ data: {} });
    const merchantData = { iban: 'IT99X0000000000000000000000' };

    await expect(api.updateMerchantData('init1', merchantData as any)).resolves.toBeUndefined();

    expect(mockMerchantDetailInstance.updateMerchantIban).toHaveBeenCalledWith(
      { initiativeId: 'init1' },
      merchantData
    );
  });

   it('patchPointOfSaleReferent calls pointOfSales method', async () => {
     const mockData = { pointOfSaleId: 'pos1' };
     const body = {
       contactName: 'Mario',
       contactSurname: 'Rossi',
       contactEmail: 'new@test.it',
     };
     mockPointOfSalesInstance.patchPointOfSaleReferent.mockResolvedValue({ data: mockData });

     const result = await api.patchPointOfSaleReferent('merch1', 'pos1', body as any);

     expect(result).toEqual(mockData);
     expect(mockPointOfSalesInstance.patchPointOfSaleReferent).toHaveBeenCalledWith(
       { merchantId: 'merch1', pointOfSaleId: 'pos1' },
       body
     );
   });

   it('putMerchantOnboardingRequest returns data', async () => {
     const mockData = { onboardingRequestId: 'onboard123', status: 'PENDING' };
     mockMerchantInitiativesOnboardingInstance.putMerchantOnboardingRequest.mockResolvedValue({
       data: mockData,
     });

     const result = await api.putMerchantOnboardingRequest('init1');

     expect(result).toEqual(mockData);
     expect(
       mockMerchantInitiativesOnboardingInstance.putMerchantOnboardingRequest
     ).toHaveBeenCalledWith({
       initiativeId: 'init1',
     });
   });
 });
