import React, { SetStateAction } from 'react';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { BASE_ROUTE } from '../../../routes';
import TotalAmount from '../TotalAmount';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const oldWindowLocation = global.window.location;

const mockedLocation = {
  assign: jest.fn(),
  pathname: `${BASE_ROUTE}/accetta-sconto/1234`,
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

afterEach(cleanup);

describe('Test suite for TotalAmount component', () => {
  test('Render component', () => {
    renderWithContext(
      <TotalAmount
        id={'1234'}
        amount={undefined}
        setAmount={jest.fn()}
        setAmountGiven={jest.fn()}
      />
    );
  });

  test('Navigate to InitiativeDiscounts page clicking the back button', async () => {
    const { history } = renderWithContext(
      <TotalAmount
        id={'1234'}
        amount={undefined}
        setAmount={jest.fn()}
        setAmountGiven={jest.fn()}
      />
    );
    const backButton = screen.getByTestId('back-to-initiative-discounts-test') as HTMLButtonElement;
    const oldLocationPathname = history.location.pathname;
    fireEvent.click(backButton);
    await waitFor(() => expect(oldLocationPathname !== history.location.pathname).toBeTruthy());
  });

  test('Form filling and submit OK', async () => {
    renderWithContext(
      <TotalAmount
        id={'1234'}
        amount={undefined}
        setAmount={jest.fn()}
        setAmountGiven={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const spendingAmountField = screen.getByLabelText(
      'pages.newDiscount.spendingAmountLabel'
    ) as HTMLInputElement;
    await user.type(spendingAmountField, '10');
    await user.click(screen.getByTestId('submit-new-discount-test'));
  });

  test('Render component with id prop undefined', async () => {
    renderWithContext(
      <TotalAmount
        // @ts-expect-error trying to render component without the required prop id
        id={undefined}
        amount={undefined}
        setAmount={jest.fn()}
        setAmountGiven={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const spendingAmountField = screen.getByLabelText(
      'pages.newDiscount.spendingAmountLabel'
    ) as HTMLInputElement;
    await user.type(spendingAmountField, '10');
    await user.click(screen.getByTestId('submit-new-discount-test'));
  });
});
