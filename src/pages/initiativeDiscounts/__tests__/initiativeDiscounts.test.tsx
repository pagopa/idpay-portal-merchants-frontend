import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BASE_ROUTE } from '../../../routes';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativeDiscounts from '../initiativeDiscounts';
import { setSelectedInitative } from '../../../redux/slices/initiativesSlice';
import { store } from '../../../redux/store';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const oldWindowLocation = global.window.location;

const mockedLocation = {
  assign: jest.fn(),
  pathname: `${BASE_ROUTE}/sconti-iniziativa/testIniziativeId`,
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

describe('Test suite for initiativeDiscounts page', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<InitiativeDiscounts />);
  });

  test('on click of back button and upload new discount button', async () => {
    const { history } = renderWithContext(<InitiativeDiscounts />);

    const merchantBackBtn = screen.getByTestId('back-btn-test') as HTMLButtonElement;

    const oldLocPathname = history.location.pathname;

    fireEvent.click(merchantBackBtn);

    await waitFor(() => expect(oldLocPathname !== history.location.pathname).toBeTruthy());

    // test upload button
    const merchantUploadBtn = screen.getByTestId('goToWizard-btn-test') as HTMLButtonElement;

    const oldLocPathnameUpload = history.location.pathname;

    fireEvent.click(merchantUploadBtn);

    await waitFor(() => expect(oldLocPathnameUpload !== history.location.pathname).toBeTruthy());
  });

  test('on change of merchant transactions tabs', async () => {
    // dispatch the selected initative to cover mapDatesFromPeriod and userCanCreateDiscount  functions
    store.dispatch(
      setSelectedInitative({
        initiativeName: 'local tests initiative name',
        spendingPeriod: '15/06/2023 - 31/07/2023',
      })
    );
    renderWithContext(<InitiativeDiscounts />, store);

    const currentDiscounts = screen.getByTestId('merchant-transactions-1');
    fireEvent.click(currentDiscounts);

    const processedDiscounts = screen.getByTestId('merchant-transactions-2');
    fireEvent.click(processedDiscounts);
  });
});
