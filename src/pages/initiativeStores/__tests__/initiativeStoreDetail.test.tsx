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
/*jest.mock(
  '../../../components/modal/ModalComponent',
  () => (props: any) =>
    props.open ? (
      <div data-testid="modal">
        <button onClick={props.onClose}>close</button>
        {props.children}
      </div>
    ) : null
);*/
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
  channelWebsite: 'site.it',
};

describe('InitiativeStoreDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await screen.findByText('Mock Store');
    const editButton = screen.getByRole('button', { name: /Modifica/i });
    await userEvent.click(editButton);
    expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    await userEvent.click(screen.getByText('commons.cancel'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    await userEvent.click(editButton);

    //click outside modal to trigger OnCLose function
    fireEvent.click(screen.getByRole('presentation').firstChild!);
  });

  test('open modal, fill fields, handleUpdateReferent', async () => {
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await screen.findByText('Mock Store');
    const editButton = screen.getByRole('button', { name: /Modifica/i });
    await userEvent.click(editButton);
    expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();

    const contactNameField = screen.getByLabelText('pages.initiativeStores.contactName');
    await userEvent.clear(contactNameField);
    await userEvent.type(contactNameField, 'Alberto');

    const contactSurnameField = screen.getByLabelText('pages.initiativeStores.contactSurname');
    await userEvent.clear(contactSurnameField);
    await userEvent.type(contactSurnameField, 'Bianchi');

    const submitButton = screen.getByTestId('update-button');
    await userEvent.click(submitButton);
    // screen.debug(undefined, Infinity);

    //wait for alert setShowSuccessAlert
    await new Promise((r) => setTimeout(r, 4000));
    const successAlert = screen.getByText('pages.initiativeStores.referentChangeSuccess');
    expect(successAlert).toBeInTheDocument();
  },10000);

  test('validates email fields on blur', async () => {
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const emailFields = screen.getAllByLabelText((content) =>
      content.startsWith('pages.initiativeStores.contactEmail')
    );
    const emailField = emailFields[0];
    mockIsValidEmail.mockReturnValueOnce(false);
    await userEvent.clear(emailField);
    await userEvent.type(emailField, 'wrong');
    await userEvent.tab(); // triggers blur
    // expect(await screen.findByText('Inserisci un indirizzo email valido')).toBeInTheDocument();

    await userEvent.clear(emailField);
    await userEvent.tab(); // triggers blur
  });

  test('handles mismatched emails', async () => {
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const emailFields = screen.getAllByLabelText((content) =>
      content.startsWith('pages.initiativeStores.contactEmail')
    );
    const [email1, email2] = emailFields;
    await userEvent.clear(email1);
    await userEvent.type(email1, 'a@a.it');
    await userEvent.clear(email2);
    await userEvent.type(email2, 'b@b.it');
    await userEvent.tab();
    expect(await screen.findAllByText('Le email non coincidono')).toHaveLength(1);
  });

  test('handles update success and alert', async () => {
    mockUpdate.mockResolvedValue(undefined);
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const modify = screen.getAllByRole('button', { name: 'commons.modify' })[1];
    await act(async () => userEvent.click(modify));
    //await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    //await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  test('handles duplicate email error', async () => {
    mockUpdate.mockResolvedValue({ code: 'POINT_OF_SALE_ALREADY_REGISTERED', message: 'mail' });
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const modify = screen.getAllByRole('button', { name: 'commons.modify' })[1];

    const submitButton = screen.getByTestId('update-button');
    await userEvent.click(submitButton);
    await waitFor(() => expect(mockAddError).toHaveBeenCalled());
  });

  test('handles generic update error', async () => {
    mockUpdate.mockResolvedValue({ code: 'OTHER' });
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const modify = screen.getAllByRole('button', { name: 'commons.modify' })[1];

    const submitButton = screen.getByTestId('update-button');
    await userEvent.click(submitButton);
    await waitFor(() => expect(mockAddError).toHaveBeenCalled());
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
    render(
      <StoreProvider>
        <InitiativeStoreDetail />
      </StoreProvider>
    );
    await screen.findByTestId('transactions');
    await userEvent.click(screen.getByText('apply'));
    await userEvent.click(screen.getByText('reset'));
    await userEvent.click(screen.getByText('sort'));
    await userEvent.click(screen.getByText('page'));
    await waitFor(() => expect(mockGetTransactions).toHaveBeenCalledTimes(5));
  });
});
