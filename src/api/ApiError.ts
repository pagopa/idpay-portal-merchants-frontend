import {
  TransactionErrorDTO,
  MerchantErrorDTO,
  RewardBatchErrorDTO,
  StatisticsErrorDTO,
  PointOfSaleErrorDTO,
} from "./generated/merchants/data-contracts";

export type MerchantPortalErrorCode =
  | TransactionErrorDTO["code"]
  | MerchantErrorDTO["code"]
  | RewardBatchErrorDTO["code"]
  | StatisticsErrorDTO["code"]
  | PointOfSaleErrorDTO["code"];

export class ApiError extends Error {
  public status: number;
  public code?: MerchantPortalErrorCode;
  public details?: unknown;

  constructor(
    status: number,
    message: string,
    code?: MerchantPortalErrorCode,
    details?: unknown
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
