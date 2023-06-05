import { InitiativeDTO, StatusEnum } from '../generated/merchants/InitiativeDTO';
import { MerchantStatisticsDTO } from '../generated/merchants/MerchantStatisticsDTO';
import { StatusEnum as TransactionStatusEnum } from '../generated/merchants/MerchantTransactionDTO';
import {
  MerchantDetailDTO,
  StatusEnum as MerchantStatusEnum,
} from '../generated/merchants/MerchantDetailDTO';
import { MerchantTransactionsListDTO } from '../generated/merchants/MerchantTransactionsListDTO';

const startDate = new Date();
const endDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

const mockedInitiativesList = [
  {
    enabled: true,
    endDate,
    initiativeId: '1234',
    initiativeName: 'Iniziativa mock 1234',
    organizationName: 'Organizzazione mock 1234',
    serviceId: '1234',
    startDate,
    status: StatusEnum.PUBLISHED,
  },
  {
    enabled: true,
    endDate,
    initiativeId: '5678',
    initiativeName: 'Iniziativa mock 5678',
    organizationName: 'Organizzazione mock 5678',
    serviceId: '5678',
    startDate,
    status: StatusEnum.CLOSED,
  },
];

const mockedMerchantTransactionList = {
  content: [
    {
      trxCode: 'string',
      trxId: '123456789',
      fiscalCode: 'string',
      effectiveAmount: 1000,
      updateDate: startDate,
      status: TransactionStatusEnum.CREATED,
    },
    {
      trxCode: 'string',
      trxId: 'asdfggfhjkl',
      fiscalCode: 'string',
      effectiveAmount: 1303,
      updateDate: startDate,
      status: TransactionStatusEnum.AUTHORIZED,
    },
    {
      trxCode: 'string',
      trxId: 'zxcvbnmzxcv',
      fiscalCode: 'string',
      effectiveAmount: 2322,
      updateDate: startDate,
      status: TransactionStatusEnum.IDENTIFIED,
    },
    {
      trxCode: 'string',
      trxId: '12345asdfgf',
      fiscalCode: 'string',
      effectiveAmount: 5000,
      updateDate: startDate,
      status: TransactionStatusEnum.REJECTED,
    },
  ],
  pageNo: 0,
  pageSize: 10,
  totalElements: 4,
  totalPages: 1,
};

const mockedMerchantInitiativeStatistics = {
  accrued: 100,
  amount: 250,
  refunded: 150,
};

const mockedMerchantDetail = {
  businessName: 'Aaronne Travel',
  certifiedEmail: 'mail@aaronnetravel.com',
  creationDate: startDate,
  fiscalCode: '12345678',
  iban: 'IT12345678901111',
  initiativeId: '1234',
  initiativeName: 'Iniziativa mock 1234',
  legalOfficeAddress: 'Via roma 23',
  legalOfficeMunicipality: 'Roma',
  legalOfficeProvince: 'Lazio',
  legalOfficeZipCode: '123456',
  status: MerchantStatusEnum.UPLOADED,
  updateDate: endDate,
  vatNumber: '123456787',
};

export const MerchantsApiMocked = {
  getMerchantInitiativeList: async (): Promise<Array<InitiativeDTO>> =>
    new Promise((resolve) => resolve(mockedInitiativesList)),

  getMerchantTransactions: async (
    _initiativeId: string,
    _page: number,
    _fiscalCode?: string,
    _status?: string
  ): Promise<MerchantTransactionsListDTO> =>
    new Promise((resolve) => resolve(mockedMerchantTransactionList)),

  getMerchantInitiativeStatistics: async (_initiativeId: string): Promise<MerchantStatisticsDTO> =>
    new Promise((resolve) => resolve(mockedMerchantInitiativeStatistics)),

  getMerchantDetail: async (_initiativeId: string): Promise<MerchantDetailDTO> =>
    new Promise((resolve) => resolve(mockedMerchantDetail)),
};
