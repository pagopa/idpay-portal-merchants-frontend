import { ENV } from "../utils/env";
import { BaseApiClient } from "./BaseApiClient";
import {
  InitiativeDTO,
  MerchantStatisticsDTO,
  MerchantDetailDTO,
  MerchantTransactionsListDTO,
  RewardBatchListDTO,
  RewardBatchDTO,
  FranchisePointOfSaleDTO,
  PointOfSaleTransactionsProcessedListDTO,
  DownloadRewardBatchResponseDTO,
  ReportListDTO,
  ReportRequest,
  TransactionResponse,
  ReportedUserDTO,
  ReportedUserCreateResponseDTO,
} from "./generated/merchants/data-contracts";

class MerchantsApiClient {
  private baseClient: BaseApiClient;

  constructor() {
    this.baseClient = new BaseApiClient({
      baseUrl: ENV.URL_API.MERCHANTS_PORTAL,
    });
  }

  private async request<T>(
    config: Parameters<BaseApiClient["safeRequest"]>[0]
  ): Promise<T> {
    const response = await this.baseClient.safeRequest<T>({
      secure: true,
      ...config,
    });
    return response.data;
  }

  public getMerchantInitiativeList(): Promise<Array<InitiativeDTO>> {
    return this.request<Array<InitiativeDTO>>({
      path: "/initiatives",
      method: "GET",
      format: "json",
    });
  }

  public getMerchantInitiativeStatistics(
    initiativeId: string
  ): Promise<MerchantStatisticsDTO> {
    return this.request<MerchantStatisticsDTO>({
      path: `/initiatives/${initiativeId}/statistics`,
      method: "GET",
      format: "json",
    });
  }

  public getMerchantDetail(
    initiativeId: string
  ): Promise<MerchantDetailDTO> {
    return this.request<MerchantDetailDTO>({
      path: `/initiatives/${initiativeId}`,
      method: "GET",
      format: "json",
    });
  }

  public getMerchantTransactions(
    initiativeId: string,
    page: number,
    fiscalCode?: string,
    status?: string
  ): Promise<MerchantTransactionsListDTO> {
    return this.request<MerchantTransactionsListDTO>({
      path: `/initiatives/${initiativeId}/transactions`,
      method: "GET",
      format: "json",
      query: { page, size: 10, fiscalCode, status },
    });
  }

  public getMerchantTransactionsProcessed(
    initiativeId: string,
    query?: Record<string, unknown>
  ): Promise<MerchantTransactionsListDTO> {
    return this.request<MerchantTransactionsListDTO>({
      path: `/initiatives/${initiativeId}/transactions/processed`,
      method: "GET",
      format: "json",
      query,
    });
  }

  public getRewardBatches(
    initiativeId: string,
    page: number,
    size: number
  ): Promise<RewardBatchListDTO> {
    return this.request<RewardBatchListDTO>({
      path: `/initiatives/${initiativeId}/reward-batches`,
      method: "GET",
      format: "json",
      query: { page, size },
    });
  }

  public getAllRewardBatches(
    initiativeId: string
  ): Promise<RewardBatchListDTO> {
    return this.request<RewardBatchListDTO>({
      path: `/initiatives/${initiativeId}/reward-batches/all`,
      method: "GET",
      format: "json",
    });
  }

  public getRewardBatchById(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<RewardBatchDTO> {
    return this.request<RewardBatchDTO>({
      path: `/initiatives/${initiativeId}/reward-batches/${rewardBatchId}`,
      method: "GET",
      format: "json",
    });
  }

  public sendRewardBatch(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<void> {
    return this.request<void>({
      path: `/initiatives/${initiativeId}/reward-batches/${rewardBatchId}/send`,
      method: "POST",
    });
  }

  public downloadBatchCsv(
    initiativeId: string,
    rewardBatchId: string
  ): Promise<DownloadRewardBatchResponseDTO> {
    return this.request<DownloadRewardBatchResponseDTO>({
      path: `/initiatives/${initiativeId}/reward-batches/${rewardBatchId}/csv`,
      method: "GET",
      format: "blob",
    });
  }

  public postponeTransaction(
    initiativeId: string,
    rewardBatchId: string,
    transactionId: string,
    initiativeEndDate: string
  ): Promise<void> {
    return this.request<void>({
      path: `/initiatives/${initiativeId}/reward-batches/${rewardBatchId}/transactions/${transactionId}/postpone`,
      method: "POST",
      format: "json",
      body: { initiativeEndDate },
    });
  }

  public getMerchantReports(
    initiativeId: string,
    page?: number,
    size?: number
  ): Promise<ReportListDTO> {
    return this.request<ReportListDTO>({
      path: `/initiative/${initiativeId}/reports`,
      method: "GET",
      format: "json",
      query: { page, size },
    });
  }

  public generateMerchantReport(
    initiativeId: string,
    body: ReportRequest
  ): Promise<void> {
    return this.request<void>({
      path: `/initiative/${initiativeId}/reports`,
      method: "POST",
      format: "json",
      body,
    });
  }

  public downloadMerchantReport(
    initiativeId: string,
    reportId: string
  ): Promise<{ reportUrl: string }> {
    return this.request<{ reportUrl: string }>({
      path: `/initiative/${initiativeId}/reports/${reportId}/download`,
      method: "GET",
      format: "json",
    });
  }

  public deleteTransaction(transactionId: string): Promise<void> {
    return this.request<void>({
      path: `/transactions/${transactionId}`,
      method: "DELETE",
    });
  }

  public createTransaction(
    body: {
      amountCents: number;
      idTrxAcquirer: string;
      initiativeId: string;
      mcc?: string;
    }
  ): Promise<TransactionResponse> {
    return this.request<TransactionResponse>({
      path: `/transactions`,
      method: "POST",
      format: "json",
      body,
    });
  }

  public authPaymentBarCode(
    trxCode: string,
    body: {
      amountCents: number;
      idTrxAcquirer: string;
    }
  ): Promise<unknown> {
    return this.request<unknown>({
      path: `/transactions/bar-code/${trxCode}/authorize`,
      method: "PUT",
      format: "json",
      body,
    });
  }

  public updateInvoiceTransaction(
    transactionId: string,
    file: File,
    docNumber?: string
  ): Promise<{ code: string; message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    if (docNumber) {
      formData.append("docNumber", docNumber);
    }

    return this.request<{ code: string; message: string }>({
      path: `/transactions/${transactionId}/invoice/update`,
      method: "PUT",
      format: "formData",
      body: formData,
    });
  }

  public downloadInvoiceFile(
    transactionId: string,
    pointOfSaleId: string
  ): Promise<{ invoiceUrl: string }> {
    return this.request<{ invoiceUrl: string }>({
      path: `/${pointOfSaleId}/transactions/${transactionId}/download`,
      method: "GET",
      format: "json",
    });
  }

  public reversalTransactionInvoiced(
    transactionId: string,
    file: File,
    docNumber?: string
  ): Promise<void | { code: string; message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    if (docNumber) {
      formData.append("docNumber", docNumber);
    }

    return this.request<void | { code: string; message: string }>({
      path: `/transactions/${transactionId}/reversal-invoiced`,
      method: "POST",
      format: "formData",
      body: formData,
    });
  }

  public getMerchantPointOfSales(
    merchantId: string,
    query?: Record<string, unknown>
  ): Promise<import("./generated/merchants/data-contracts").ListPointOfSaleDTO> {
    return this.request<
      import("./generated/merchants/data-contracts").ListPointOfSaleDTO
    >({
      path: `/${merchantId}/point-of-sales`,
      method: "GET",
      format: "json",
      query,
    });
  }

  public getMerchantPointOfSalesById(
    merchantId: string,
    pointOfSaleId: string
  ): Promise<import("./generated/merchants/data-contracts").PointOfSaleDTO> {
    return this.request<
      import("./generated/merchants/data-contracts").PointOfSaleDTO
    >({
      path: `/${merchantId}/point-of-sales/${pointOfSaleId}`,
      method: "GET",
      format: "json",
    });
  }

  public updateMerchantPointOfSales(
    merchantId: string,
    body: Array<
      import("./generated/merchants/data-contracts").PointOfSaleDTO
    >
  ): Promise<void> {
    return this.request<void>({
      path: `/${merchantId}/point-of-sales`,
      method: "PUT",
      format: "json",
      body,
    });
  }

  public getMerchantPointOfSaleTransactionsProcessed(
    initiativeId: string,
    pointOfSaleId: string,
    query?: Record<string, unknown>
  ): Promise<PointOfSaleTransactionsProcessedListDTO> {
    return this.request<PointOfSaleTransactionsProcessedListDTO>({
      path: `/initiatives/${initiativeId}/point-of-sales/${pointOfSaleId}/transactions/processed`,
      method: "GET",
      format: "json",
      query,
    });
  }

  public getMerchantPointOfSalesWithTransactions(
    rewardBatchId: string
  ): Promise<Array<FranchisePointOfSaleDTO>> {
    return this.request<Array<FranchisePointOfSaleDTO>>({
      path: `/point-of-sales/${rewardBatchId}`,
      method: "GET",
      format: "json",
    });
  }

  public getReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<Array<ReportedUserDTO>> {
    return this.request<Array<ReportedUserDTO>>({
      path: `/reported-user/${userFiscalCode}`,
      method: "GET",
      format: "json",
      headers: {
        "initiative-id": initiativeId,
      },
    });
  }

  public createReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> {
    return this.request<ReportedUserCreateResponseDTO>({
      path: `/reported-user/${userFiscalCode}`,
      method: "POST",
      format: "json",
      headers: {
        "initiative-id": initiativeId,
      },
    });
  }

  public deleteReportedUser(
    initiativeId: string,
    userFiscalCode: string
  ): Promise<ReportedUserCreateResponseDTO> {
    return this.request<ReportedUserCreateResponseDTO>({
      path: `/reported-user/${userFiscalCode}`,
      method: "DELETE",
      format: "json",
      headers: {
        "initiative-id": initiativeId,
      },
    });
  }
}

let merchantsApiInstance: MerchantsApiClient | null = null;

export const getMerchantsApi = (): MerchantsApiClient => {
  if (!merchantsApiInstance) {
    merchantsApiInstance = new MerchantsApiClient();
  }
  return merchantsApiInstance;
};
