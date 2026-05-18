import { ENV } from '../utils/env';
import {
  InitiativeDTO,
  MerchantStatisticsDTO,
  MerchantDetailDTO,
  MerchantTransactionsListDTO,
  RewardBatchListDTO,
  RewardBatchDTO,
  DownloadRewardBatchResponseDTO,
  PointOfSaleTransactionsProcessedListDTO,
  TransactionResponse,
  ReportedUserDTO,
  ReportedUserCreateResponseDTO,
} from './generated/merchants/data-contracts';

import { Transactions } from './generated/merchants/Transactions';
import { Initiatives } from './generated/merchants/Initiatives';
import { MerchantId } from './generated/merchants/MerchantId';
import { ReportedUser } from './generated/merchants/ReportedUser';
import { axiosFetchAdapter } from './axiosFetchAdapter';

class MerchantsApiClient {
  private transactions: Transactions;
  private initiatives: Initiatives;
  private merchantId: MerchantId;
  private reportedUser: ReportedUser;

  constructor() {
    const baseConfig = {
      baseUrl: ENV.URL_API.MERCHANTS_PORTAL,
      customFetch: axiosFetchAdapter,
    };

    this.transactions = new Transactions(baseConfig);
    this.initiatives = new Initiatives(baseConfig);
    this.merchantId = new MerchantId(baseConfig);
    this.reportedUser = new ReportedUser(baseConfig);
  }

  // ===== INITIATIVES =====

  public async getMerchantInitiativeList(): Promise<Array<InitiativeDTO>> {
    const res = await this.initiatives.getMerchantInitiativeList();
    return res.data;
  }

  public async getMerchantInitiativeStatistics(
    initiativeId: string
  ): Promise<MerchantStatisticsDTO> {
    const res =
      await this.initiatives.getMerchantInitiativeStatistics(initiativeId);
    return res.data;
  }

  public async getMerchantDetail(
    initiativeId: string
  ): Promise<MerchantDetailDTO> {
    const res = await this.initiatives.getMerchantDetail(initiativeId);
    return res.data;
  }

  // ===== TRANSACTIONS =====

  public async getMerchantTransactions(
    initiativeId: string,
    page: number,
    fiscalCode?: string,
    status?: string
  ): Promise<MerchantTransactionsListDTO> {
    const res = await this.initiatives.getMerchantTransactions(
      initiativeId,
      { page, size: 10, fiscalCode, status }
    );
    return res.data;
  }

  public async getMerchantTransactionsProcessed(
    initiativeId: string,
    query?: {
      page?: number;
      size?: number;
      fiscalCode?: string;
      status?: string;
      rewardBatchId?: string;
      rewardBatchTrxStatus?: string;
      pointOfSaleId?: string;
      trxCode?: string;
    }
  ): Promise<MerchantTransactionsListDTO> {
    const res =
      await this.initiatives.getMerchantTransactionsProcessed(
        initiativeId,
        query
      );
    return res.data;
  }

  public async createTransaction(body: {
    amountCents: number;
    idTrxAcquirer: string;
    initiativeId: string;
    mcc?: string;
  }): Promise<TransactionResponse> {
    const res = await this.transactions.createTransaction(body as any);
    return res.data;
  }

  public async deleteTransaction(transactionId: string): Promise<void> {
    const res = await this.transactions.deleteTransaction(transactionId);
    return res.data;
  }

  public async reversalTransactionInvoiced(
    transactionId: string,
    file: File,
    docNumber?: string
  ): Promise<void> {
    const res = await this.transactions.reversalTransactionInvoiced(
      transactionId,
      { file, docNumber } as any
    );
    return res.data;
  }

  public async authPaymentBarCode(
    trxCode: string,
    body: { amountCents: number; idTrxAcquirer: string }
  ): Promise<unknown> {
    const res = await this.transactions.authPaymentBarCode(trxCode, body as any);
    return res.data;
  }

  public async updateInvoiceTransaction(
    transactionId: string,
    file: File,
    docNumber?: string
  ): Promise<{ code: string; message: string } | void> {
    const res = await this.transactions.updateInvoiceTransaction(
      transactionId,
      { file, docNumber } as any
    );
    return res.data as any;
  }

  public async downloadInvoiceFile(
    pointOfSaleId: string,
    transactionId: string
  ): Promise<any> {
    // legacy endpoint not present in swagger – fallback to processed list filtering
    const res = await this.getMerchantTransactionsProcessed(
      pointOfSaleId,
      { trxCode: transactionId }
    );
    return res as any;
  }

  // ===== POINT OF SALES =====

  public async getMerchantPointOfSales(
    merchantId: string
  ): Promise<any> {
    const res = await this.merchantId.getPointOfSales(merchantId);
    return res.data;
  }

  public async updateMerchantPointOfSales(
    merchantId: string,
    body: any
  ): Promise<void> {
    const res = await this.merchantId.putPointOfSales(merchantId, body);
    return res.data;
  }

  public async getMerchantPointOfSalesById(
    merchantId: string,
    pointOfSaleId: string
  ): Promise<any> {
    const res = await this.merchantId.getPointOfSale(
      merchantId,
      pointOfSaleId
    );
    return res.data;
  }

  public async getMerchantPointOfSaleTransactionsProcessed(
    initiativeId: string,
    pointOfSaleId: string,
    query?: {
      page?: number;
      size?: number;
      fiscalCode?: string;
      status?: "REWARDED" | "CANCELLED" | "REFUNDED" | "INVOICED";
    }
  ): Promise<PointOfSaleTransactionsProcessedListDTO> {
    const res =
      await this.initiatives.getPointOfSaleTransactionsProcessed(
        initiativeId,
        pointOfSaleId,
        query
      );
    return res.data;
  }

  // ===== REWARD BATCH =====

  public async getRewardBatches(
    initiativeId: string,
    page: number,
    size: number
  ): Promise<RewardBatchListDTO> {
    const res = await this.initiatives.getRewardBatches(
      initiativeId,
      { page, size }
    );
    return res.data;
  }

  public async getRewardBatchById(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<RewardBatchDTO> {
    const res = await this.initiatives.getRewardBatchById(
      initiativeId,
      rewardBatchId
    );
    return res.data;
  }

  public async sendRewardBatch(
    initiativeId: string,
    batchId: string
  ): Promise<void> {
    const res = await this.initiatives.sendRewardBatches(
      initiativeId,
      batchId
    );
    return res.data;
  }

  public async getAllRewardBatches(
    initiativeId: string
  ): Promise<RewardBatchListDTO> {
    return this.getRewardBatches(initiativeId, 0, 1000);
  }

  public async downloadBatchCsv(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<DownloadRewardBatchResponseDTO> {
    return this.downloadApprovedRewardBatch(
      initiativeId,
      rewardBatchId
    );
  }

  public async getMerchantReports(): Promise<any> {
    return Promise.resolve([] as any);
  }

  public async generateMerchantReport(): Promise<void> {
    return Promise.resolve();
  }

  public async downloadMerchantReport(): Promise<any> {
    return Promise.resolve();
  }

  public async postponeTransaction(
    initiativeId: string,
    rewardBatchId: string,
    transactionId: string
  ): Promise<void> {
    const res = await this.initiatives.postponeTransaction(
      initiativeId,
      rewardBatchId,
      transactionId
    );
    return res.data;
  }

  public async downloadApprovedRewardBatch(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<DownloadRewardBatchResponseDTO> {
    const res =
      await this.initiatives.approveDownloadRewardBatch(
        initiativeId,
        rewardBatchId
      );
    return res.data;
  }

  // ===== REPORTED USER =====

  public async getReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<Array<ReportedUserDTO>> {
    const res = await this.reportedUser.getReportedUser(
      userFiscalCode,
      { headers: { 'initiative-id': initiativeId } }
    );
    return res.data;
  }

  public async createReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> {
    const res = await this.reportedUser.createReportedUser(
      userFiscalCode,
      { headers: { 'initiative-id': initiativeId } }
    );
    return res.data;
  }

  public async deleteReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> {
    const res = await this.reportedUser.deleteReportedUser(
      userFiscalCode,
      { headers: { 'initiative-id': initiativeId } }
    );
    return res.data;
  }
}

let merchantsApiInstance: MerchantsApiClient | null = null;

export const getMerchantsApi = (): MerchantsApiClient => {
  if (!merchantsApiInstance) {
    merchantsApiInstance = new MerchantsApiClient();
  }
  return merchantsApiInstance;
};
