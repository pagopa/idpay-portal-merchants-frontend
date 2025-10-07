import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InitiativeStoreDetail from '../InitiativeStoreDetail';
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
    render(<InitiativeStoreDetail />);
    expect(await screen.findByText('Mock Store')).toBeInTheDocument();
    expect(mockGetById).toHaveBeenCalled();
    expect(mockGetTransactions).toHaveBeenCalled();
  });

  test('opens and closes modal', async () => {
    render(<InitiativeStoreDetail />);
    await screen.findByText('Mock Store');
    const editButton = screen.getByRole('button', { name: /Modifica/i });
    await userEvent.click(editButton);
    expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument();
    screen.debug();
    //await userEvent.click(screen.getByText('close'));
    //expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  test.skip('validates email fields on blur', async () => {
    render(<InitiativeStoreDetail />);
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    screen.debug();
    const emailField = screen.getByLabelText('pages.initiativeStores.contactEmail:test@test.it');
    mockIsValidEmail.mockReturnValueOnce(false);
    await userEvent.clear(emailField);
    await userEvent.type(emailField, 'wrong');
    await userEvent.tab(); // triggers blur
    expect(await screen.findByText('Inserisci un indirizzo email valido')).toBeInTheDocument();
  });

  test.skip('handles mismatched emails', async () => {
    render(<InitiativeStoreDetail />);
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const email1 = screen.getAllByLabelText('pages.initiativeStores.contactEmail')[0];
    const email2 = screen.getAllByLabelText('pages.initiativeStores.contactEmail')[1];
    await userEvent.clear(email1);
    await userEvent.type(email1, 'a@a.it');
    await userEvent.clear(email2);
    await userEvent.type(email2, 'b@b.it');
    await userEvent.tab();
    expect(await screen.findAllByText('Le email non coincidono')).toHaveLength(2);
  });

  test.skip('handles update success and alert', async () => {
    mockUpdate.mockResolvedValue(undefined);
    render(<InitiativeStoreDetail />);
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const modify = screen.getAllByRole('button', { name: 'commons.modify' })[1];
    await act(async () => userEvent.click(modify));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  test.skip('handles duplicate email error', async () => {
    mockUpdate.mockResolvedValue({ code: 'POINT_OF_SALE_ALREADY_REGISTERED', message: 'mail' });
    render(<InitiativeStoreDetail />);
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const modify = screen.getAllByRole('button', { name: 'commons.modify' })[1];
    await userEvent.click(modify);
    await waitFor(() => expect(mockAddError).toHaveBeenCalled());
  });

  test.skip('handles generic update error', async () => {
    mockUpdate.mockResolvedValue({ code: 'OTHER' });
    render(<InitiativeStoreDetail />);
    await userEvent.click(await screen.findByRole('button', { name: /Modifica/i }));
    const modify = screen.getAllByRole('button', { name: 'commons.modify' })[1];
    await userEvent.click(modify);
    await waitFor(() => expect(mockAddError).toHaveBeenCalled());
  });

  test('handles fetchStoreDetail failure', async () => {
    mockGetById.mockRejectedValueOnce(new Error('fail'));
    render(<InitiativeStoreDetail />);
    await waitFor(() =>
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'GET_MERCHANT_DETAIL' })
      )
    );
  });

  test('handles fetchStoreTransactions failure', async () => {
    mockGetTransactions.mockRejectedValueOnce(new Error('fail'));
    render(<InitiativeStoreDetail />);
    await waitFor(() =>
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'GET_MERCHANT_TRANSACTIONS' })
      )
    );
  });

  test('calls handleFiltersApplied, handleFiltersReset, sort and pagination', async () => {
    render(<InitiativeStoreDetail />);
    await screen.findByTestId('transactions');
    await userEvent.click(screen.getByText('apply'));
    await userEvent.click(screen.getByText('reset'));
    await userEvent.click(screen.getByText('sort'));
    await userEvent.click(screen.getByText('page'));
    await waitFor(() => expect(mockGetTransactions).toHaveBeenCalledTimes(5));
  });
});
