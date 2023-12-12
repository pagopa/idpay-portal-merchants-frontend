import React, { useState as useStateMock } from 'react';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { BASE_ROUTE } from '../../../routes';
import TotalAmount from '../TotalAmount';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
const setActiveStep = jest.fn();
const setOpenExitModal = jest.fn();

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setActiveStep]);
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setOpenExitModal]);
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
        steps={2}
        activeStep={0}
        setActiveStep={jest.fn()}
      />
    );
  });

  test('Navigate to InitiativeDiscounts page clicking the back button', async () => {
    const { history } = renderWithContext(
      <TotalAmount
        id={'1234'}
        amount={undefined}
        setAmount={jest.fn()}
        steps={2}
        activeStep={0}
        setActiveStep={jest.fn()}
      />
    );
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [0, setActiveStep]);
    const backButton = screen.getByTestId('back-action-test') as HTMLButtonElement;
    const oldLocationPathname = history.location.pathname;
    fireEvent.click(backButton);
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [true, setOpenExitModal]);
  });

  test('Render component', () => {
    renderWithContext(
      <TotalAmount
        id={'1234'}
        amount={undefined}
        setAmount={jest.fn()}
        steps={2}
        activeStep={0}
        setActiveStep={jest.fn()}
      />
    );
  });

  test('Form filling and submit OK', async () => {
    renderWithContext(
      <TotalAmount
        id={'1234'}
        amount={undefined}
        setAmount={jest.fn()}
        steps={2}
        activeStep={0}
        setActiveStep={jest.fn()}
      />
    );
    const user = userEvent.setup();
    const spendingAmountField = screen.getByLabelText(
      'pages.newDiscount.spendingAmountLabel'
    ) as HTMLInputElement;
    await user.type(spendingAmountField, '100');
    await user.click(screen.getByTestId('continue-action-test'));
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [1, setActiveStep]);
  });

  // test('Render component with id prop undefined', async () => {
  //   renderWithContext(
  //     <TotalAmount
  //       // @ts-expect-error trying to render component without the required prop id
  //       id={undefined}
  //       amount={undefined}
  //       setAmount={jest.fn()}
  //       steps={2}
  //       activeStep={0}
  //       setActiveStep={jest.fn()}
  //     />
  //   );
  //   const user = userEvent.setup();
  //   const spendingAmountField = screen.getByLabelText(
  //     'pages.newDiscount.spendingAmountLabel'
  //   ) as HTMLInputElement;
  //   await user.type(spendingAmountField, '10');
  //   await user.click(screen.getByTestId('continue-action-test'));
  // });

  // test('Render component', () => {
  //   renderWithContext(
  //     <TotalAmount
  //       id={'1234'}
  //       amount={undefined}
  //       setAmount={jest.fn()}
  //       steps={2}
  //       activeStep={0}
  //       setActiveStep={jest.fn()}
  //     />
  //   );
  // });
});
