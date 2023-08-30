import { screen } from '@testing-library/react';
import React from 'react';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { MerchantTransactionsListDTO } from '../../../api/generated/merchants/MerchantTransactionsListDTO';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import MerchantTransactions from '../MerchantTransactions';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
describe('test suite for MerchantTransactions', () => {
  test('render component MerchantTransactions', () => {
    renderWithContext(<MerchantTransactions id={'testId2222'} />);
  });

  test('Render component when user filters results', async () => {
    renderWithContext(<MerchantTransactions id={'testId2222'} />);
    const user = userEvent.setup();
    const filterByUser = screen.getByLabelText(
      'pages.initiativeDiscounts.searchByFiscalCode'
    ) as HTMLInputElement;

    await user.type(filterByUser, 'test');

    await user.click(screen.getByTestId('apply-filters-test'));
  });

  test('Render component when user resets filters', async () => {
    renderWithContext(<MerchantTransactions id={'testId2222'} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('reset-filters-test'));
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
