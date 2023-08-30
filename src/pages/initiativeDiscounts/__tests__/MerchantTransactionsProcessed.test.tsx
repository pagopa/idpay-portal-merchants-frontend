import { screen } from '@testing-library/react';
import React from 'react';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import MerchantTransactionsProcessed from '../MerchantTransactionsProcessed';
import { MerchantTransactionsProcessedListDTO } from '../../../api/generated/merchants/MerchantTransactionsProcessedListDTO';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('test suite for MerchantTransactionsProcessed', () => {
  test('render of component MerchantTransactionsProcessed', () => {
    renderWithContext(<MerchantTransactionsProcessed id={'testId2222'} />);
  });

  test('Render component when user filters results', async () => {
    renderWithContext(<MerchantTransactionsProcessed id={'testId2222'} />);
    const user = userEvent.setup();
    const filterByUser = screen.getByLabelText(
      'pages.initiativeDiscounts.searchByFiscalCode'
    ) as HTMLInputElement;

    await user.type(filterByUser, 'test');

    await user.click(screen.getByTestId('apply-filters-test'));
  });

  test('Render component when user resets filters', async () => {
    renderWithContext(<MerchantTransactionsProcessed id={'testId2222'} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('reset-filters-test'));
  });

  test('should render initative empty component in case of  Error from getMerchantTransactions API response', async () => {
    MerchantsApiMocked.getMerchantTransactionsProcessed =
      async (): Promise<MerchantTransactionsProcessedListDTO> =>
        Promise.reject('mocked error response for tests');

    renderWithContext(<MerchantTransactionsProcessed id={'testId2222'} />);

    const emptyDiscountList = await screen.findByText(
      'pages.initiativeDiscounts.emptyProcessedList'
    );

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

    const emptyDiscountList = await screen.findByText(
      'pages.initiativeDiscounts.emptyProcessedList'
    );

    expect(emptyDiscountList).toBeInTheDocument();
  });
});
