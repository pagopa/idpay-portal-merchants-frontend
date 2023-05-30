import { InitiativeDTO } from '../generated/merchants/InitiativeDTO';

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
    status: 'PUBLISHED',
  },
  {
    enabled: true,
    endDate,
    initiativeId: '5678',
    initiativeName: 'Iniziativa mock 5678',
    organizationName: 'Organizzazione mock 5678',
    serviceId: '5678',
    startDate,
    status: 'CLOSED',
  },
];

export const MerchantsApiMocked = {
  getMerchantInitiativeList: async (): Promise<Array<InitiativeDTO>> =>
    new Promise((resolve) => resolve(mockedInitiativesList)),
};
