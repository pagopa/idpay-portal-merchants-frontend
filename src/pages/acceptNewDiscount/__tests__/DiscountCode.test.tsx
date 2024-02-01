import React, { SetStateAction } from 'react';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { BASE_ROUTE } from '../../../routes';
import DiscountCode from '../DiscountCode';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';

jest.mock('../../../services/merchantService');

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
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
  });

  test('User clicks back button', async () => {
    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    await user.click(screen.getByTestId('back-action-test'));
  });

  test('Form filling and submit OK', async () => {
    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_NOT_FOUND_OR_EXPIRED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 404, value: { code: 'PAYMENT_NOT_FOUND_OR_EXPIRED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_USER_NOT_ASSOCIATED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_USER_NOT_ASSOCIATED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_NOT_ALLOWED_FOR_TRX_STATUS', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({
        right: { status: 400, value: { code: 'PAYMENT_NOT_ALLOWED_FOR_TRX_STATUS' } },
      });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_ALREADY_AUTHORIZED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 403, value: { code: 'PAYMENT_ALREADY_AUTHORIZED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_BUDGET_EXHAUSTED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_BUDGET_EXHAUSTED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_GENERIC_REJECTED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_GENERIC_REJECTED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_USER_SUSPENDED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_USER_SUSPENDED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_MERCHANT_NOT_ONBOARDED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({
        right: { status: 404, value: { code: 'PAYMENT_MERCHANT_NOT_ONBOARDED' } },
      });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_AMOUNT_NOT_VALID', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_AMOUNT_NOT_VALID' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_USER_UNSUBSCRIBED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_USER_UNSUBSCRIBED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_USER_NOT_ONBOARDED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_USER_NOT_ONBOARDED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_NOT_ALLOWED_MISMATCHED_MERCHANT', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({
        right: { status: 400, value: { code: 'PAYMENT_NOT_ALLOWED_MISMATCHED_MERCHANT' } },
      });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_INITIATIVE_INVALID_DATE', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({
        right: { status: 400, value: { code: 'PAYMENT_INITIATIVE_INVALID_DATE' } },
      });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_INITIATIVE_NOT_FOUND', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_INITIATIVE_NOT_FOUND' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with error code PAYMENT_TRANSACTION_EXPIRED', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> =>
      Promise.resolve({ right: { status: 400, value: { code: 'PAYMENT_TRANSACTION_EXPIRED' } } });

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });

  test('Form filling and submit KO with promise rejected', async () => {
    MerchantsApiMocked.authPaymentBarCode = async (
      _trxCode: string,
      _amountCents: number
    ): Promise<any> => Promise.reject('error');

    renderWithContext(
      <DiscountCode
        id={'1234'}
        amount={100}
        code={undefined}
        setCode={jest.fn()}
        steps={2}
        activeStep={1}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const discountCodeField = screen.getByLabelText(
      'pages.acceptNewDiscount.discountCodeLabel'
    ) as HTMLInputElement;
    await user.type(discountCodeField, 'qwertyui');
    await user.click(screen.getByTestId('continue-action-test'));
  });
});
