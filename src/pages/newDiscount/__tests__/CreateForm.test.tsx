import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import CreateForm from '../CreateForm';
import { BASE_ROUTE } from '../../../routes';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { TransactionResponse } from '../../../api/generated/merchants/TransactionResponse';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const oldWindowLocation = global.window.location;

const mockedLocation = {
  assign: jest.fn(),
  pathname: `${BASE_ROUTE}/crea-sconto/1234`,
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

describe('Test suite for CreateForm component', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(
      <CreateForm id={'1234'} setDiscountCreated={jest.fn()} setDiscountResponse={jest.fn()} />
    );
  });

  test('Form filling and submit OK', async () => {
    renderWithContext(
      <CreateForm id={'1234'} setDiscountCreated={jest.fn()} setDiscountResponse={jest.fn()} />
    );
    const user = userEvent.setup();
    const spendingAmountField = screen.getByLabelText(
      'pages.newDiscount.spendingAmountLabel'
    ) as HTMLInputElement;
    await user.type(spendingAmountField, '10');
    await user.click(screen.getByTestId('submit-new-discount-test'));
  });

  test('Submit KO', async () => {
    MerchantsApiMocked.createTransaction = async (
      _amountCents: number,
      _idTrxIssuer: string,
      _initiativeId: string,
      _trxDate: Date,
      _mcc: string | undefined
    ): Promise<TransactionResponse> => Promise.reject('testing catch case');

    renderWithContext(
      <CreateForm id={'1234'} setDiscountCreated={jest.fn()} setDiscountResponse={jest.fn()} />
    );

    const user = userEvent.setup();
    const spendingAmountField = screen.getByLabelText(
      'pages.newDiscount.spendingAmountLabel'
    ) as HTMLInputElement;
    await user.type(spendingAmountField, '10');
    await user.click(screen.getByTestId('submit-new-discount-test'));
  });
});
