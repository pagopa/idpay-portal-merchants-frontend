import { screen } from '@testing-library/react';
import React from 'react';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import MerchantTransactionsProcessed from '../MerchantTransactionsProcessed';
import { MerchantTransactionsProcessedListDTO } from '../../../api/generated/merchants/MerchantTransactionsProcessedListDTO';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('test suite for MerchantTransactionsProcessed', () => {
  test('render of component MerchantTransactionsProcessed', () => {
    renderWithContext(<MerchantTransactionsProcessed id={'testId2222'} />);
  });

  test('should render initative empty component in case of  Error from getMerchantTransactions API response', async () => {
    MerchantsApiMocked.getMerchantTransactionsProcessed =
      async (): Promise<MerchantTransactionsProcessedListDTO> =>
        Promise.reject('mocked error response for tests');

    renderWithContext(<MerchantTransactionsProcessed id={'testId2222'} />);

    const emptyDiscountList = await screen.findByText('pages.initiativeDiscounts.emptyList');

    expect(emptyDiscountList).toBeInTheDocument();
  });

  test('render of component MerchantTransactionsProcessed in case of empty content from Api getMerchantTransactionsProcessed', async () => {
    MerchantsApiMocked.getMerchantTransactionsProcessed =
      async (): Promise<MerchantTransactionsProcessedListDTO> =>
        new Promise((resolve) =>
          resolve({
            content: [],
            pageNo: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0,
          })
        );
    renderWithContext(<MerchantTransactionsProcessed id={'testId2222'} />);

    const emptyDiscountList = await screen.findByText('pages.initiativeDiscounts.emptyList');

    expect(emptyDiscountList).toBeInTheDocument();
  });
});
