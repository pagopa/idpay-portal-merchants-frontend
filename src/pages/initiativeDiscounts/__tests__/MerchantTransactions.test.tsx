import { screen } from '@testing-library/react';
import React from 'react';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { MerchantTransactionsListDTO } from '../../../api/generated/merchants/MerchantTransactionsListDTO';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import MerchantTransactions from '../MerchantTransactions';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
describe('test suite for MerchantTransactionsProcessed', () => {
  test('render of component MerchantTransactionsProcessed', () => {
    renderWithContext(<MerchantTransactions id={'testId2222'} />);
  });

  test('should render MerchantTransactions content array is empty from getMerchantTransactions API response', async () => {
    MerchantsApiMocked.getMerchantTransactions = async (): Promise<MerchantTransactionsListDTO> =>
      new Promise((resolve) =>
        resolve({
          content: [],
          pageNo: 0,
          pageSize: 10,
          totalElements: 0,
          totalPages: 0,
        })
      );

    renderWithContext(<MerchantTransactions id={'testId2222'} />);

    const emptyDiscountList = await screen.findByText('pages.initiativeDiscounts.emptyList');

    expect(emptyDiscountList).toBeInTheDocument();
  });

  test('should render initative empty component in case of  Error from getMerchantTransactions API response', async () => {
    MerchantsApiMocked.getMerchantTransactions = async (): Promise<MerchantTransactionsListDTO> =>
      Promise.reject('mocked error response for tests');

    renderWithContext(<MerchantTransactions id={'testId2222'} />);

    const emptyDiscountList = await screen.findByText('pages.initiativeDiscounts.emptyList');

    expect(emptyDiscountList).toBeInTheDocument();
  });
});
