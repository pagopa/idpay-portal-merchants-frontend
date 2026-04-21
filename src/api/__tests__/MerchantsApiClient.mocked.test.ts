import '@testing-library/jest-dom';
import {
  MerchantsApiMocked,
  mockedInitiativesList,
  mockedMerchantTransactionList,
  mockedMerchantInitiativeStatistics,
  mockedMerchantDetail,
  transactionResponseMocked,
  authPaymentBarCodeResponseMocked,
} from '../__mocks__/MerchantsApiClient';

describe('MerchantsApiClient mock coverage', () => {
  it('should resolve initiatives list', async () => {
    const res = await MerchantsApiMocked.getMerchantInitiativeList();
    expect(res).toBe(mockedInitiativesList);
  });

  it('should resolve merchant transactions list', async () => {
    const res = await MerchantsApiMocked.getMerchantTransactions();
    expect(res).toBe(mockedMerchantTransactionList);
  });

  it('should resolve merchant initiative statistics', async () => {
    const res = await MerchantsApiMocked.getMerchantInitiativeStatistics();
    expect(res).toBe(mockedMerchantInitiativeStatistics);
  });

  it('should resolve merchant detail', async () => {
    const res = await MerchantsApiMocked.getMerchantDetail();
    expect(res).toBe(mockedMerchantDetail);
  });

  it('should resolve deleteTransaction', async () => {
    await expect(MerchantsApiMocked.deleteTransaction()).resolves.toBeUndefined();
  });

  it('should resolve createTransaction', async () => {
    const res = await MerchantsApiMocked.createTransaction();
    expect(res).toBe(transactionResponseMocked);
  });

  it('should resolve authPaymentBarCode', async () => {
    const res = await MerchantsApiMocked.authPaymentBarCode();
    expect(res).toBe(authPaymentBarCodeResponseMocked);
  });
});
