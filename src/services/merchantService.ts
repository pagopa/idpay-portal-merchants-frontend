import { SyncTrxStatus } from '../api/generated/payment-qr-code/SyncTrxStatus';
import { TransactionCreationRequest } from '../api/generated/payment-qr-code/TransactionCreationRequest';
import { TransactionResponse } from '../api/generated/payment-qr-code/TransactionResponse';
import { MerchantApi } from '../api/MerchantsApiClient';

export const createTransaction = (
  merchantId: string,
  trx: TransactionCreationRequest
): Promise<TransactionResponse> => MerchantApi.createTransaction(merchantId, trx);

export const getStatusTransaction = (merchantId: string, transactionId: string): Promise<SyncTrxStatus> =>
MerchantApi.getStatusTransaction(merchantId, transactionId);

export const confirmPaymentQRCode = (
  merchantId: string,
  transactionId: string
): Promise<TransactionResponse> => MerchantApi.confirmPaymentQRCode(merchantId, transactionId);
