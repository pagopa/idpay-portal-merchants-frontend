import {
  InitiativeDTO,
  MerchantStatisticsDTO,
  MerchantDetailDTO,
  MerchantTransactionsListDTO,
  TransactionResponse,
  AuthPaymentResponseDTO,
} from "../generated/merchants/data-contracts";

const startDate = new Date();
const endDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

export const mockedInitiativesList: Array<InitiativeDTO> = [
  {
    enabled: true,
    endDate: endDate.toISOString(),
    initiativeId: "1234",
    initiativeName: "Iniziativa mock 1234",
    organizationName: "Organizzazione mock 1234",
    serviceId: "1234",
    startDate: startDate.toISOString(),
    status: "PUBLISHED",
  } as unknown as InitiativeDTO,
];

export const mockedMerchantTransactionList: MerchantTransactionsListDTO = {
  content: [],
  pageNo: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
} as MerchantTransactionsListDTO;

export const mockedMerchantInitiativeStatistics: MerchantStatisticsDTO = {
  accruedCents: 100,
  amountCents: 250,
  refundedCents: 150,
} as MerchantStatisticsDTO;

export const mockedMerchantDetail: MerchantDetailDTO = {
  initiativeId: "1234",
  initiativeName: "Iniziativa mock 1234",
  status: "PUBLISHED",
} as unknown as MerchantDetailDTO;

export const transactionResponseMocked: TransactionResponse = {
  id: "000001",
  initiativeId: "1234",
  status: "PUBLISHED",
} as unknown as TransactionResponse;

export const authPaymentBarCodeResponseMocked: AuthPaymentResponseDTO =
  {} as AuthPaymentResponseDTO;

export const MerchantsApiMocked = {
  getMerchantInitiativeList: async (): Promise<Array<InitiativeDTO>> =>
    Promise.resolve(mockedInitiativesList),

  getMerchantTransactions: async (): Promise<MerchantTransactionsListDTO> =>
    Promise.resolve(mockedMerchantTransactionList),

  getMerchantInitiativeStatistics: async (): Promise<MerchantStatisticsDTO> =>
    Promise.resolve(mockedMerchantInitiativeStatistics),

  getMerchantDetail: async (): Promise<MerchantDetailDTO> =>
    Promise.resolve(mockedMerchantDetail),

  deleteTransaction: async (): Promise<void> => Promise.resolve(),

  createTransaction: async (): Promise<TransactionResponse> =>
    Promise.resolve(transactionResponseMocked),

  authPaymentBarCode: async (): Promise<AuthPaymentResponseDTO> =>
    Promise.resolve(authPaymentBarCodeResponseMocked),
};
