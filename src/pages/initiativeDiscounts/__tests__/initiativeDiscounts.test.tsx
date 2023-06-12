import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MerchantsApiMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { StatusEnum as TransactionStatusEnum } from '../../../api/generated/merchants/MerchantTransactionDTO';
import { MerchantTransactionsListDTO } from '../../../api/generated/merchants/MerchantTransactionsListDTO';
import { BASE_ROUTE } from '../../../routes';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativeDiscounts from '../initiativeDiscounts';

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

  test('test filter by fiscalCode and status of initiativeDiscounts, onClick of submit button and reset button  ', async () => {
    renderWithContext(<InitiativeDiscounts />);

    //TEXTFIELD TEST

    const searcMerchant = screen.getByLabelText(
      'pages.initiativeDiscounts.searchByFiscalCode'
    ) as HTMLInputElement;

    fireEvent.change(searcMerchant, { target: { value: 'searcFiscalCode' } });
    expect(searcMerchant.value).toBe('searcFiscalCode');

    expect(searcMerchant).toBeInTheDocument();

    //SELECT TEST

    const filterStatus = screen.getByTestId('filterStatus-select') as HTMLSelectElement;

    fireEvent.click(filterStatus);

    fireEvent.change(filterStatus, {
      target: { value: TransactionStatusEnum.AUTHORIZED },
    });

    await waitFor(() => expect(filterStatus.value).toBe(TransactionStatusEnum.AUTHORIZED));

    // SUBMIT BUTTON TEST

    const filterBtn = screen.getByTestId('apply-filters-test') as HTMLButtonElement;
    fireEvent.click(filterBtn);

    // RESET BUTTON TEST

    fireEvent.change(searcMerchant, { target: { value: 'search fiscal code' } });
    expect(searcMerchant.value).toBe('search fiscal code');

    const resetBtn = screen.getByText('commons.removeFiltersBtn') as HTMLButtonElement;

    fireEvent.click(resetBtn);

    await waitFor(() => expect(searcMerchant.value).toEqual(''));
  });

  test('on click of AUTHORIZE trx in status CREATED', async () => {
    renderWithContext(<InitiativeDiscounts />);

    const actionMenuList = await screen.findAllByTestId('menu-open-test');

    const transactionCreated = actionMenuList[0];

    fireEvent.click(transactionCreated);

    const authorizeTrxButton = await screen.findByTestId('authorize-trx-button');

    fireEvent.click(authorizeTrxButton);
    // wait authorize modal to open
    const closeAuthorizeModalBtn = await screen.findByText('commons.closeBtn');

    fireEvent.click(closeAuthorizeModalBtn);

    const closeActionMenuButton = screen.getByTestId('menu-close-test');

    fireEvent.click(closeActionMenuButton);
  });

  test('on click of Cancel trx in status AUTHORIZED', async () => {
    renderWithContext(<InitiativeDiscounts />);

    const actionMenuList = await screen.findAllByTestId('menu-open-test');

    const transactionAuthorized = actionMenuList[1];

    fireEvent.click(transactionAuthorized);

    const cancelTrxButton = await screen.findByTestId('cancel-trx-button');

    fireEvent.click(cancelTrxButton);
    // wait for cancel modal to open
    const modalCancelButton = await screen.findByTestId('modal-cancel-button-test');

    fireEvent.click(modalCancelButton);

    const closeActionMenuButton = screen.getByTestId('menu-close-test');

    fireEvent.click(closeActionMenuButton);

    // test on click of transaction in status IDENTIFIED and REJECTED

    const transactionIdentified = actionMenuList[2];

    fireEvent.click(transactionIdentified);

    const transactionRejected = actionMenuList[3];

    fireEvent.click(transactionRejected);
  });

  test('should render initative empty component in case of  Error from getMerchantTransactions API response', async () => {
    MerchantsApiMocked.getMerchantTransactions = async (): Promise<MerchantTransactionsListDTO> =>
      Promise.reject('mocked error response for tests');

    renderWithContext(<InitiativeDiscounts />);

    const emptyDiscountList = await screen.findByText('pages.initiativeDiscounts.emptyList');

    expect(emptyDiscountList).toBeInTheDocument();
  });
});
