import { ENV } from '../utils/env';
import {
  InitiativeDTO,
  MerchantStatisticsDTO,
  MerchantDetailDTO,
  MerchantTransactionsListDTO,
  RewardBatchListDTO,
  RewardBatchDTO,
  DownloadRewardBatchResponseDTO,
  ReportListDTO,
  ReportRequest,
  ReportDTO,
  DownloadReportResponseDTO,
  ReportedUserDTO,
  ReportedUserCreateResponseDTO,
  MerchantIbanPatchDTO,
  DownloadInvoiceResponseDTO,
  GetFranchisePointOfSaleData,
  PointOfSaleDTO,
  TransactionResponse,
  PointOfSaleTransactionsProcessedListDTO,
} from './generated/merchants/data-contracts';

import { MerchantInitiatives } from './generated/merchants/MerchantInitiatives';
import { MerchantInitiativeStatistics } from './generated/merchants/MerchantInitiativeStatistics';
import { MerchantDetail } from './generated/merchants/MerchantDetail';
import { MerchantTransactions } from './generated/merchants/MerchantTransactions';
import { Transaction } from './generated/merchants/Transaction';
import { RewardBatches } from './generated/merchants/RewardBatches';
import { PointOfSales } from './generated/merchants/PointOfSales';
import { PointOfSaleTransactions } from './generated/merchants/PointOfSaleTransactions';
import { MerchantReport } from './generated/merchants/MerchantReport';
import { ReportedUser } from './generated/merchants/ReportedUser';
import { axiosFetchAdapter } from './axiosFetchAdapter';

class MerchantsApiClient {
  private merchantInitiatives: MerchantInitiatives;
  private merchantStatistics: MerchantInitiativeStatistics;
  private merchantDetail: MerchantDetail;
  private merchantTransactions: MerchantTransactions;
  private transaction: Transaction;
  private rewardBatches: RewardBatches;
  private pointOfSales: PointOfSales;
  private pointOfSaleTransactions: PointOfSaleTransactions;
  private merchantReport: MerchantReport;
  private reportedUser: ReportedUser;

  constructor() {
    const baseConfig = {
      baseUrl: ENV.URL_API.MERCHANTS_PORTAL,
      customFetch: axiosFetchAdapter,
    };

    this.merchantInitiatives = new MerchantInitiatives(baseConfig);
    this.merchantStatistics = new MerchantInitiativeStatistics(baseConfig);
    this.merchantDetail = new MerchantDetail(baseConfig);
    this.merchantTransactions = new MerchantTransactions(baseConfig);
    this.transaction = new Transaction(baseConfig);
    this.rewardBatches = new RewardBatches(baseConfig);
    this.pointOfSales = new PointOfSales(baseConfig);
    this.pointOfSaleTransactions = new PointOfSaleTransactions(baseConfig);
    this.merchantReport = new MerchantReport(baseConfig);
    this.reportedUser = new ReportedUser(baseConfig);
  }

  public async getMerchantInitiativeList(): Promise<Array<InitiativeDTO>> {
    const res = await this.merchantInitiatives.getMerchantInitiativeList();
    return res.data;
  }

  public async getMerchantInitiativeStatistics(
    initiativeId: string
  ): Promise<MerchantStatisticsDTO> {
    const res = await this.merchantStatistics.getMerchantInitiativeStatistics({
      initiativeId,
    });
    return res.data;
  }

  public async getMerchantDetail(initiativeId: string): Promise<MerchantDetailDTO> {
    const res = await this.merchantDetail.getMerchantDetail({ initiativeId });
    return res.data;
  }

  public async updateMerchantIban(
    initiativeId: string,
    body: MerchantIbanPatchDTO
  ): Promise<MerchantDetailDTO> {
    const res = await this.merchantDetail.updateMerchantIban({ initiativeId }, body);
    return res.data;
  }

  public async getMerchantTransactions(
    initiativeId: string,
    page?: number,
    fiscalCode?: string,
    status?: string,
    size?: number
  ): Promise<MerchantTransactionsListDTO> {
    const res = await this.merchantTransactions.getMerchantTransactions({
      initiativeId,
      page,
      size,
      fiscalCode,
      status,
    });
    return res.data;
  }

  public async getMerchantTransactionsProcessed(
    initiativeId: string,
    query?: Record<string, unknown>
  ): Promise<MerchantTransactionsListDTO> {
    const res = await this.merchantTransactions.getMerchantTransactionsProcessed({
      initiativeId,
      ...(query ?? {}),
    });
    return res.data;
  }

  public async deleteTransaction(_transactionId: string): Promise<void> {
    return Promise.resolve();
  }

  public async createTransaction(_body: {
    amountCents: number;
    idTrxAcquirer: string;
    initiativeId: string;
    mcc?: string;
  }): Promise<TransactionResponse> {
    return Promise.resolve({} as TransactionResponse);
  }

  public async authPaymentBarCode(
    _trxCode: string,
    _body: { amountCents: number; idTrxAcquirer: string }
  ): Promise<unknown> {
    return Promise.resolve({});
  }

  public async reversalTransactionInvoiced(
    transactionId: string,
    file: File,
    docNumber?: string
  ): Promise<void> {
    await this.transaction.reversalTransactionInvoiced({ transactionId }, { file, docNumber });
  }

  public async updateInvoiceTransaction(
    transactionId: string,
    file: File,
    docNumber?: string
  ): Promise<void> {
    await this.transaction.updateInvoiceTransaction({ transactionId }, { file, docNumber });
  }

  public async downloadInvoiceFile(
    pointOfSaleId: string,
    transactionId: string
  ): Promise<DownloadInvoiceResponseDTO> {
    const res = await this.transaction.downloadInvoiceFile({
      pointOfSaleId,
      transactionId,
    });
    return res.data;
  }

  public async updateMerchantPointOfSales(
    initiativeId: string,
    merchantId: string,
    pointOfSales: Array<PointOfSaleDTO>
  ): Promise<void> {
    await this.pointOfSales.postPointOfSales({ merchantId, initiativeId }, pointOfSales);
  }

  public async getMerchantPointOfSales(
    initiativeId: string,
    merchantId: string,
    query?: Record<string, unknown>
  ): Promise<unknown> {
    const res = await this.pointOfSales.getPointOfSalesByInitiative({
      initiativeId,
      merchantId,
      ...(query ?? {}),
    });
    return res.data;
  }

  public async getMerchantPointOfSalesCatalog(
    merchantId: string,
    query?: Record<string, unknown>
  ): Promise<unknown> {
    const res = await this.pointOfSales.getPointOfSales({
      merchantId,
      ...(query ?? {}),
    });
    return res.data;
  }

  public async getMerchantPointOfSalesById(
    initiativeId: string,
    merchantId: string,
    pointOfSaleId: string
  ): Promise<PointOfSaleDTO> {
    const res = await this.pointOfSales.getPointOfSaleByInitiative({
      initiativeId,
      merchantId,
      pointOfSaleId,
    });
    return res.data;
  }

  public async getMerchantPointOfSaleTransactionsProcessed(
    initiativeId: string,
    pointOfSaleId: string,
    query?: Record<string, unknown>
  ): Promise<PointOfSaleTransactionsProcessedListDTO> {
    const res = await this.pointOfSaleTransactions.getPointOfSaleTransactionsProcessed({
      initiativeId,
      pointOfSaleId,
      ...(query ?? {}),
    });
    return res.data;
  }

  public async getMerchantPointOfSalesWithTransactions(
    rewardBatchId: string
  ): Promise<GetFranchisePointOfSaleData> {
    const res = await this.transaction.getFranchisePointOfSale({
      rewardBatchId,
    });
    return res.data;
  }

  public async getRewardBatches(
    initiativeId: string,
    page?: number,
    size?: number
  ): Promise<RewardBatchListDTO> {
    const res = await this.rewardBatches.getRewardBatches({
      initiativeId,
      page,
      size,
    });
    return res.data;
  }

  public async getAllRewardBatches(initiativeId: string): Promise<RewardBatchListDTO> {
    return this.getRewardBatches(initiativeId);
  }

  public async getRewardBatchById(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<RewardBatchDTO> {
    const res = await this.rewardBatches.getRewardBatchById({
      initiativeId,
      rewardBatchId,
    });
    return res.data;
  }

  public async sendRewardBatch(initiativeId: string, batchId: string): Promise<void> {
    await this.rewardBatches.sendRewardBatches({
      initiativeId,
      batchId,
    });
  }

  public async downloadBatchCsv(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<DownloadRewardBatchResponseDTO> {
    const res = await this.rewardBatches.approveDownloadRewardBatch({
        initiativeId,
        rewardBatchId,
      },
      { format: 'json' }
    );
    return res.data;
  }

  public async postponeTransaction(
    initiativeId: string,
    rewardBatchId: string,
    transactionId: string
  ): Promise<void> {
    await this.rewardBatches.postponeTransaction({
      initiativeId,
      rewardBatchId,
      transactionId,
    });
  }

  private static readonly EMPTY_REPORT: ReportListDTO = {
    content: [],
    page: {
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
    },
  } as unknown as ReportListDTO;

  public async getMerchantReports(
    initiativeId: string,
    page?: number,
    size?: number
  ): Promise<ReportListDTO> {
    const res = await this.merchantReport.getMerchantTransactionsReports(
      {
        initiativeId,
        page,
        size,
      },
      { format: 'json' }
    );

    const data = res.data as ReportListDTO | null;

    if (!data) {
      return MerchantsApiClient.EMPTY_REPORT;
    }

    return data;
  }

  public async generateMerchantReport(
    initiativeId: string,
    body: ReportRequest
  ): Promise<ReportDTO> {
    const res = await this.merchantReport.generateReport({ initiativeId }, body, {
      format: 'json',
    });
    return res.data;
  }

  public async downloadMerchantReport(
    initiativeId: string,
    reportId: string
  ): Promise<DownloadReportResponseDTO> {
    const res = await this.merchantReport.downloadTransactionsReport(
      {
        initiativeId,
        reportId,
      },
      { format: 'json' }
    );
    return res.data;
  }

  public async getReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<Array<ReportedUserDTO>> {
    const res = await this.reportedUser.getReportedUser(
      { initiativeId, userFiscalCode },
      { headers: { 'initiative-id': initiativeId } }
    );
    return res.data;
  }

  public async createReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> {
    const res = await this.reportedUser.createReportedUser(
      { initiativeId, userFiscalCode },
      { headers: { 'initiative-id': initiativeId } }
    );
    return res.data;
  }

  public async deleteReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> {
    const res = await this.reportedUser.deleteReportedUser(
      { initiativeId, userFiscalCode },
      { headers: { 'initiative-id': initiativeId } }
    );
    return res.data;
  }

  public async updateMerchantData(
    initiativeId: string,
    merchantData: MerchantIbanPatchDTO
  ): Promise<void> {
    await this.merchantDetail.updateMerchantIban({ initiativeId }, merchantData);
  }
}

let merchantsApiInstance: MerchantsApiClient | null = null;

export const getMerchantsApi = (): MerchantsApiClient => {
  if (!merchantsApiInstance) {
    merchantsApiInstance = new MerchantsApiClient();
  }
  return merchantsApiInstance;
};
