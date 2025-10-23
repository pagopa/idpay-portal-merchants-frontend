import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InitiativeStoreDetail from '../initiativeStoreDetail';
import { useParams } from 'react-router-dom';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import {
  getMerchantPointOfSalesById,
  getMerchantPointOfSaleTransactionsProcessed,
  updateMerchantPointOfSales,
} from '../../../services/merchantService';
import { parseJwt } from '../../../utils/jwt-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { isValidEmail } from '../../../helpers';
import { POS_TYPE } from '../../../utils/constants';
import { StoreProvider } from '../StoreContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));
jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');
jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSalesById: jest.fn(),
  getMerchantPointOfSaleTransactionsProcessed: jest.fn(),
  updateMerchantPointOfSales: jest.fn(),
}));
jest.mock('../../../utils/jwt-utils');
jest.mock('@pagopa/selfcare-common-frontend/utils/storage');
jest.mock('../../../helpers');
jest.mock('../../components/BreadcrumbsBox', () => () => <div data-testid="breadcrumbs-box" />);
jest.mock('../../../components/Transactions/MerchantTransactions', () => (props: any) => (
  <div data-testid="transactions">
    <button onClick={() => props.handleFiltersApplied({ f: 1 })}>apply</button>
    <button onClick={() => props.handleFiltersReset()}>reset</button>
    <button onClick={() => props.handleSortChange([{ field: 'fiscalCode', sort: 'asc' }])}>
      sort
    </button>
    <button onClick={() => props.handlePaginationPageChange(2)}>page</button>
  </div>
));
jest.mock('../../../components/labelValuePair/labelValuePair', () => (props: any) => (
  <div data-testid="labelpair">{props.label + ':' + props.value}</div>
));
jest.mock('../InitiativeDetailCard', () => (props: any) => (
  <div data-testid="initiative-card">{props.children}</div>
));

const mockAddError = jest.fn();
const mockUseParams = useParams as jest.Mock;
const mockUseError = useErrorDispatcher as jest.Mock;
const mockParseJwt = parseJwt as jest.Mock;
const mockStorage = storageTokenOps as jest.Mocked<typeof storageTokenOps>;
const mockIsValidEmail = isValidEmail as jest.Mock;
const mockGetById = getMerchantPointOfSalesById as jest.Mock;
const mockGetTransactions = getMerchantPointOfSaleTransactionsProcessed as jest.Mock;
const mockUpdate = updateMerchantPointOfSales as jest.Mock;

const mockStore = {
  id: 'store1',
  franchiseName: 'Mock Store',
  contactName: 'Mario',
  contactSurname: 'Rossi',
  contactEmail: 'test@test.it',
  type: POS_TYPE.Physical,
  address: 'Via Roma',
  zipCode: '00100',
  city: 'Roma',
  province: 'RM',
  website: 'site.it',
  channelPhone: '123456789',
  channelEmail: 'channel@test.it',
  channelGeolink: 'https://maps.google.com',
};

describe('InitiativeStoreDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseParams.mockReturnValue({ id: 'initiative1', store_id: 'store1' });
    mockUseError.mockReturnValue(mockAddError);
    mockParseJwt.mockReturnValue({ merchant_id: 'm1' });
    mockStorage.read.mockReturnValue('jwt');
    mockIsValidEmail.mockReturnValue(true);
    mockGetById.mockResolvedValue(mockStore);
    mockGetTransactions.mockResolvedValue({
      content: [{ trxDate: new Date(), updateDate: new Date() }],
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders store detail and calls APIs', async () => {
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    expect(await screen.findByText('Mock Store')).toBeInTheDocument();
    expect(mockGetById).toHaveBeenCalled();
    expect(mockGetTransactions).toHaveBeenCalled();
  });

  test('opens and closes modal', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await screen.findByText('Mock Store');
    const editButton = screen.getByRole('button', { name: /Modifica/i });
    await user.click(editButton);
    expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    await user.click(screen.getByText('commons.cancel'));

    await user.click(editButton);
    const backdrop = screen.getByRole('presentation').firstChild as HTMLElement;
    fireEvent.click(backdrop);
  });

  test('open modal, fill fields, handleUpdateReferent', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdate.mockResolvedValue(undefined);

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await screen.findByText('Mock Store');
    const editButton = screen.getByRole('button', { name: /Modifica/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const contactNameField = inputs[0];
    const contactSurnameField = inputs[1];
    const emailField1 = inputs[2];
    const emailField2 = inputs[3];

    await user.clear(contactNameField);
    await user.type(contactNameField, 'Alberto');

    await user.clear(contactSurnameField);
    await user.type(contactSurnameField, 'Bianchi');

    await user.clear(emailField1);
    await user.type(emailField1, 'new@email.it');

    await user.clear(emailField2);
    await user.type(emailField2, 'new@email.it');

    const submitButton = screen.getByTestId('update-button');
    await user.click(submitButton);

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(await screen.findByText('pages.initiativeStores.referentChangeSuccess')).toBeInTheDocument();
  });

  test('validates email fields on blur', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Modifica/i }));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const emailField = inputs[2];

    mockIsValidEmail.mockReturnValue(false);
    await user.clear(emailField);
    await user.type(emailField, 'wrong');
    fireEvent.blur(emailField);

    expect(await screen.findByText('Inserisci un indirizzo email valido')).toBeInTheDocument();

    mockIsValidEmail.mockReturnValue(true);
    await user.clear(emailField);
    fireEvent.blur(emailField);
    expect(await screen.findByText('Il campo è obbligatorio')).toBeInTheDocument();
  });

  test('handles mismatched emails', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Modifica/i }));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const email1 = inputs[2];
    const email2 = inputs[3];

    await user.clear(email1);
    await user.type(email1, 'a@a.it');
    await user.clear(email2);
    await user.type(email2, 'b@b.it');
    fireEvent.blur(email2);

    expect(await screen.findAllByText('Le email non coincidono')).toHaveLength(2);
  });

  test('handles update success and alert', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdate.mockResolvedValue(undefined);

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Modifica/i }));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const emailField1 = inputs[2];
    const emailField2 = inputs[3];

    await user.clear(emailField1);
    await user.type(emailField1, 'new@test.it');

    await user.clear(emailField2);
    await user.type(emailField2, 'new@test.it');

    const submitButton = screen.getByTestId('update-button');
    await user.click(submitButton);

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
  });

  test('handles duplicate email error', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdate.mockResolvedValue({ code: 'POINT_OF_SALE_ALREADY_REGISTERED', message: 'mail' });

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Modifica/i }));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const emailField1 = inputs[2];
    const emailField2 = inputs[3];

    await user.clear(emailField1);
    await user.type(emailField1, 'duplicate@test.it');

    await user.clear(emailField2);
    await user.type(emailField2, 'duplicate@test.it');

    const submitButton = screen.getByTestId('update-button');
    await user.click(submitButton);

    await waitFor(() => expect(mockAddError).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'UPDATE_STORES',
        displayableTitle: 'errors.duplicateEmailError'
      })
    ));
  });

  test('handles generic update error', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdate.mockResolvedValue({ code: 'OTHER' });

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Modifica/i }));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const emailField1 = inputs[2];
    const emailField2 = inputs[3];

    await user.clear(emailField1);
    await user.type(emailField1, 'test@test.com');

    await user.clear(emailField2);
    await user.type(emailField2, 'test@test.com');

    const submitButton = screen.getByTestId('update-button');
    await user.click(submitButton);

    await waitFor(() => expect(mockAddError).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'UPDATE_STORES',
        displayableTitle: 'errors.genericTitle'
      })
    ));
  });

  test('handles fetchStoreDetail failure', async () => {
    mockGetById.mockRejectedValueOnce(new Error('fail'));

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await waitFor(() =>
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'GET_MERCHANT_DETAIL' })
      )
    );
  });

  test('handles fetchStoreTransactions failure', async () => {
    mockGetTransactions.mockRejectedValueOnce(new Error('fail'));

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await waitFor(() =>
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'GET_MERCHANT_TRANSACTIONS' })
      )
    );
  });

  test('calls handleFiltersApplied, handleFiltersReset, sort and pagination', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await screen.findByTestId('transactions');
    await user.click(screen.getByText('apply'));
    await user.click(screen.getByText('reset'));
    await user.click(screen.getByText('sort'));
    await user.click(screen.getByText('page'));

    await waitFor(() => expect(mockGetTransactions).toHaveBeenCalledTimes(5));
  });

  test('prevents update when email matches existing contactEmail', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await screen.findByText('Mock Store');
    await user.click(screen.getByRole('button', { name: /Modifica/i }));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('update-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('E-Mail già censita')).toHaveLength(2);
    });
  });

  test('validates required fields on submit', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Modifica/i }));

    await waitFor(() => {
      expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const contactNameField = inputs[0];
    const contactSurnameField = inputs[1];
    const emailField1 = inputs[2];
    const emailField2 = inputs[3];

    await user.clear(contactNameField);
    await user.clear(contactSurnameField);
    await user.clear(emailField1);
    await user.clear(emailField2);

    const submitButton = screen.getByTestId('update-button');
    await user.click(submitButton);

    expect(await screen.findAllByText('Il campo è obbligatorio')).toHaveLength(4);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});