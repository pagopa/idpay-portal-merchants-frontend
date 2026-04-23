import '@testing-library/jest-dom';
import * as merchantServiceMock from '../__mocks__/merchantService';
import { MerchantsApiMocked } from '../../api/__mocks__/MerchantsApiClient';

describe('merchantService mock coverage', () => {
  it('should forward getMerchantInitiativeList', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'getMerchantInitiativeList');
    await merchantServiceMock.getMerchantInitiativeList();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should forward getMerchantTransactions', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'getMerchantTransactions');
    await merchantServiceMock.getMerchantTransactions('INIT', 0, 'CF', 'STATUS');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should forward getMerchantTransactionsProcessed', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'getMerchantTransactions');
    await merchantServiceMock.getMerchantTransactionsProcessed('INIT', 0, 'CF', 'STATUS');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should forward getMerchantInitiativeStatistics', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'getMerchantInitiativeStatistics');
    await merchantServiceMock.getMerchantInitiativeStatistics('INIT');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should forward getMerchantDetail', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'getMerchantDetail');
    await merchantServiceMock.getMerchantDetail('INIT');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should forward deleteTransaction', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'deleteTransaction');
    await merchantServiceMock.deleteTransaction('TRX');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should forward createTransaction', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'createTransaction');
    await merchantServiceMock.createTransaction(100, 'ACQ', 'INIT', undefined);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should forward authPaymentBarCode', async () => {
    const spy = jest.spyOn(MerchantsApiMocked, 'authPaymentBarCode');
    await merchantServiceMock.authPaymentBarCode('TRXCODE', 100, 'ACQ');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
