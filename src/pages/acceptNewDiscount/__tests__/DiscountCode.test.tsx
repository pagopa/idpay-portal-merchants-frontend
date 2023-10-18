import React, { SetStateAction } from 'react';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { BASE_ROUTE } from '../../../routes';
import DiscountCode from '../DiscountCode';

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

describe('Test suite for DiscountCode component', () => {
  test('Render component', () => {
    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        setAmountGiven={jest.fn()}
        code={undefined}
        setCode={jest.fn()}
      />
    );
  });

  test('Form filling and submit OK', async () => {
    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        setAmountGiven={jest.fn()}
        code={undefined}
        setCode={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText('Codice sconto') as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('submit-new-discount-test'));
  });
});
