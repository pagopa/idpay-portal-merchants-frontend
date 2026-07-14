import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InitiativeStoreDetail from '../initiativeStoreDetail';
import { useParams, MemoryRouter } from 'react-router-dom';
import {
  getMerchantPointOfSalesById,
  getMerchantPointOfSaleTransactionsProcessed,
  patchPointOfSaleReferent,
} from '../../../services/merchantService';
import { parseJwt } from '../../../utils/jwt-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { isValidRegex, handlePromptMessage } from '../../../helpers';
import { POS_TYPE } from '../../../utils/constants';
import { StoreProvider } from '../StoreContext';
import { browserConsole } from '../../../utils/consoleLogger';
import { useAppSelector } from '../../../redux/hooks';
import { Provider } from 'react-redux';
import {
  createMockStore,
  openEditModal,
  fillAndConfirmEmailsByIndex,
} from '../../../test-utils/initiativeStoresTestUtils';

const mockSetAlert = jest.fn();
const mockSetStoreId = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));
jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSalesById: jest.fn(),
  getMerchantPointOfSaleTransactionsProcessed: jest.fn(),
  patchPointOfSaleReferent: jest.fn(),
}));
jest.mock('../../../utils/jwt-utils');
jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage');
jest.mock('../../../helpers');
jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: mockSetAlert }),
}));
jest.mock('../../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: () => ({
    defaultConfig: {
      regex: {
        email: '^.+@.+\\..+$',
      },
    },
  }),
}));
jest.mock('../StoreContext', () => {
  const actual = jest.requireActual('../StoreContext');
  return {
    ...actual,
    useStore: () => ({
      storeId: '',
      setStoreId: mockSetStoreId,
    }),
  };
});
jest.mock('../../components/BreadcrumbsBox', () => () => <div data-testid="breadcrumbs-box" />);
jest.mock('../../../components/Transactions/MerchantTransactions', () => (props: any) => (
  <div data-testid="transactions">
    <div data-testid="transactions-loading">{String(props.dataTableIsLoading)}</div>
    <div data-testid="transactions-sort-model">{JSON.stringify(props.sortModel)}</div>
    <div data-testid="transactions-page">{String(props.paginationModel?.page ?? '')}</div>
    <button onClick={() => props.handleFiltersApplied({ f: 1 })}>apply</button>
    <button onClick={() => props.handleFiltersReset()}>reset</button>
    <button onClick={() => props.handleSortChange([{ field: 'fiscalCode', sort: 'asc' }])}>
      sort-fiscal
    </button>
    <button onClick={() => props.handleSortChange([{ field: 'trxDate', sort: 'desc' }])}>
      sort-trxDate
    </button>
    <button onClick={() => props.handlePaginationPageChange(2)}>page</button>
    <button onClick={() => props.handlePaginationPageChange(4)}>page-with-sort</button>
  </div>
));
jest.mock('../../../components/labelValuePair/labelValuePair', () => (props: any) => (
  <div data-testid="labelpair">{props.label + ':' + props.value + ':' + String(props.isLink)}</div>
));
jest.mock('../InitiativeDetailCard', () => (props: any) => (
  <div data-testid="initiative-card">{props.children}</div>
));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: () => null,
  default: () => null,
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockUseParams = useParams as jest.Mock;
const mockParseJwt = parseJwt as jest.Mock;
const mockStorage = storageTokenOps as jest.Mocked<typeof storageTokenOps>;
const mockIsValidRegex = isValidRegex as jest.Mock;
const mockHandlePromptMessage = handlePromptMessage as jest.Mock;
const mockGetById = getMerchantPointOfSalesById as jest.Mock;
const mockGetTransactions = getMerchantPointOfSaleTransactionsProcessed as jest.Mock;
const mockPatchPointOfSaleReferent = patchPointOfSaleReferent as jest.Mock;

const mockStore = {
  id: 'store1',
  franchiseName: 'Mock Store',
  contactName: 'Mario',
  contactSurname: 'Rossi',
  contactEmail: 'test@test.it',
  type: POS_TYPE.Physical,
  address: 'Via Roma',
  streetNumber: '10',
  zipCode: '00100',
  city: 'Roma',
  province: 'RM',
  website: 'http://site.it',
  channelPhone: '123456789',
  channelEmail: 'channel@test.it',
  channelGeolink: 'https://maps.google.com',
};

const store = createMockStore();

describe('InitiativeStoreDetail', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ initiative_id: 'initiative1', store_id: 'store1' });
    mockParseJwt.mockReturnValue({ merchant_id: 'm1' });
    mockStorage.read.mockReturnValue('jwt');
    mockIsValidRegex.mockReturnValue(true);
    mockHandlePromptMessage.mockReturnValue(true);
    mockGetById.mockResolvedValue(mockStore);
    mockGetTransactions.mockResolvedValue({
      content: [
        {
          trxDate: '2024-01-01',
          updateDate: '2024-01-02',
          trxChargeDate: '2024-01-03',
        },
      ],
      page: 0,
      totalElements: 1,
    });
  });

  const renderWithProviders = () =>
    render(
      <MemoryRouter>
        <Provider store={store}>
          <StoreProvider>
            <InitiativeStoreDetail />
          </StoreProvider>
        </Provider>
      </MemoryRouter>
    );

  test('renders store detail, initializes modal fields and calls APIs', async () => {
    renderWithProviders();

    expect(await screen.findByText('Mock Store')).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativeStores.address:Via Roma, 10 - 00100, Roma, RM:false')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativeStores.website:http://site.it:true')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativeStores.geoLink:https://maps.google.com:true')
    ).toBeInTheDocument();
    expect(screen.getByText('pages.initiativeStores.contactName:Mario:false')).toBeInTheDocument();
    expect(mockGetById).toHaveBeenCalledWith('initiative1', 'm1', 'store1');
    expect(mockGetTransactions).toHaveBeenCalledWith('initiative1', 'store1', { size: 10 });
    expect(mockSetStoreId).toHaveBeenCalledWith('store1');

    await openEditModal(userEvent.setup({ delay: null }));
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('Mario');
    expect(inputs[1]).toHaveValue('Rossi');
    expect(inputs[2]).toHaveValue('test@test.it');
    expect(inputs[3]).toHaveValue('test@test.it');
  });

  test('renders only non physical fields for non physical store', async () => {
    mockGetById.mockResolvedValueOnce({
      ...mockStore,
      type: 'ONLINE',
      website: 'plain-site.it',
    });

    renderWithProviders();

    expect(await screen.findByText('Mock Store')).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativeStores.website:plain-site.it:false')
    ).toBeInTheDocument();
    expect(screen.queryByText(/pages\.initiativeStores\.address:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/pages\.initiativeStores\.phone:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/pages\.initiativeStores\.geoLink:/)).not.toBeInTheDocument();
  });

  test('opens and closes modal through cancel and backdrop', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders();

    await openEditModal(user);
    await user.click(screen.getByText('actions.cancel'));
    await waitFor(() => {
      expect(screen.queryByText('pages.initiativeStores.modalDescription')).not.toBeInTheDocument();
    });

    await openEditModal(user);
    const backdrop = screen.getByRole('presentation').firstChild as HTMLElement;
    fireEvent.click(backdrop);
  });

  test('validates required name and surname fields on blur', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders();

    await openEditModal(user);

    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    fireEvent.blur(inputs[0]);
    await user.clear(inputs[1]);
    fireEvent.blur(inputs[1]);

    expect(await screen.findAllByText('Il campo è obbligatorio')).toHaveLength(2);
  });

  test('validates email fields on blur for invalid and empty values', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders();

    await openEditModal(user);

    const inputs = screen.getAllByRole('textbox');
    const emailField = inputs[2];

    mockIsValidRegex.mockReturnValue(false);
    await user.clear(emailField);
    await user.type(emailField, 'wrong');
    fireEvent.blur(emailField);

    expect(await screen.findByText('Inserisci un indirizzo email valido')).toBeInTheDocument();

    mockIsValidRegex.mockReturnValue(true);
    await user.clear(emailField);
    fireEvent.blur(emailField);
    expect(await screen.findByText('Il campo è obbligatorio')).toBeInTheDocument();
  });

  test('handles mismatched emails on blur and clears errors on change', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders();

    await openEditModal(user);

    const inputs = screen.getAllByRole('textbox');
    const email1 = inputs[2];
    const email2 = inputs[3];

    await user.clear(email1);
    await user.type(email1, 'a@a.it');
    await user.clear(email2);
    await user.type(email2, 'b@b.it');
    fireEvent.blur(email2);

    expect(await screen.findAllByText('Le email non coincidono')).toHaveLength(2);

    await user.clear(email2);
    await user.type(email2, 'a@a.it');

    await waitFor(() => {
      expect(screen.queryByText('Le email non coincidono')).not.toBeInTheDocument();
    });
  });

  test('does not call update when submit validation fails', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders();

    await openEditModal(user);

    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    await user.clear(inputs[1]);
    await user.clear(inputs[2]);
    await user.clear(inputs[3]);

    await user.click(screen.getByTestId('update-button'));

    expect(mockPatchPointOfSaleReferent).not.toHaveBeenCalled();
    expect(await screen.findAllByText('Il campo è obbligatorio')).toHaveLength(4);
  });

  test('handles successful update flow and refreshes detail', async () => {
    const user = userEvent.setup({ delay: null });
    mockPatchPointOfSaleReferent.mockResolvedValueOnce(undefined);

    renderWithProviders();

    await openEditModal(user);
    await fillAndConfirmEmailsByIndex(user, 'new@test.it');
    await user.click(screen.getByTestId('update-button'));

    await waitFor(() => {
      expect(mockPatchPointOfSaleReferent).toHaveBeenCalledWith('m1', 'store1', {
        contactName: 'Mario',
        contactSurname: 'Rossi',
        contactEmail: 'new@test.it',
      });
    });

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        text: 'pages.initiativeStores.referentChangeSuccess',
        isOpen: true,
        severity: 'success',
      });
    });
    expect(mockGetById).toHaveBeenCalledTimes(2);
  });

  test('handles duplicate email error returned by update service', async () => {
    const user = userEvent.setup({ delay: null });
    mockPatchPointOfSaleReferent.mockRejectedValueOnce({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'mail',
    });

    renderWithProviders();

    await openEditModal(user);
    await fillAndConfirmEmailsByIndex(user, 'different@test.it');
    await user.click(screen.getByTestId('update-button'));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.duplicateEmailError',
        text: 'different@test.it è già associata ad altro punto vendita',
        isOpen: true,
        severity: 'error',
      });
    });
  });

  test('handles generic update error returned by update service', async () => {
    const user = userEvent.setup({ delay: null });
    mockPatchPointOfSaleReferent.mockRejectedValueOnce({ code: 'OTHER' });

    renderWithProviders();

    await openEditModal(user);
    await fillAndConfirmEmailsByIndex(user, 'different@test.it');
    await user.click(screen.getByTestId('update-button'));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
  });

  test('handles fetchStoreDetail failure', async () => {
    mockGetById.mockRejectedValueOnce(new Error('fail'));

    renderWithProviders();

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
  });

  test('handles fetchStoreTransactions failure', async () => {
    const consoleSpy = jest.spyOn(browserConsole, 'error').mockImplementation(() => undefined);
    mockGetTransactions.mockRejectedValueOnce(new Error('fail'));

    renderWithProviders();

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      });
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('skips transaction mapping when content is missing', async () => {
    mockGetTransactions.mockResolvedValueOnce({
      page: 0,
      totalElements: 0,
    });

    renderWithProviders();

    await screen.findByTestId('transactions');
    expect(screen.getByTestId('transactions-loading')).toHaveTextContent('false');
  });

  test('calls handleFiltersApplied, handleFiltersReset, sort and pagination for both sort branches', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders();

    await screen.findByTestId('transactions');
    await user.click(screen.getByText('apply'));
    await user.click(screen.getByText('reset'));
    await user.click(screen.getByText('sort-fiscal'));
    await user.click(screen.getByText('page-with-sort'));
    await user.click(screen.getByText('sort-trxDate'));
    await user.click(screen.getByText('page'));

    await waitFor(() => {
      expect(mockGetTransactions).toHaveBeenNthCalledWith(2, 'initiative1', 'store1', {
        size: 10,
        f: 1,
      });
      expect(mockGetTransactions).toHaveBeenNthCalledWith(3, 'initiative1', 'store1', {
        size: 10,
      });
      expect(mockGetTransactions).toHaveBeenNthCalledWith(4, 'initiative1', 'store1', {
        size: 10,
        sort: 'userId,asc',
      });
      expect(mockGetTransactions).toHaveBeenNthCalledWith(5, 'initiative1', 'store1', {
        size: 10,
        page: 4,
        sort: 'userId,asc',
      });
      expect(mockGetTransactions).toHaveBeenNthCalledWith(6, 'initiative1', 'store1', {
        size: 10,
        sort: 'trxDate,desc',
      });
      expect(mockGetTransactions).toHaveBeenNthCalledWith(7, 'initiative1', 'store1', {
        size: 10,
        page: 2,
        sort: 'trxDate,desc',
      });
    });
  });

  test('Prompt clears sessionStorage when navigating to a different page', () => {
    const removeItemSpy = jest.spyOn(window.sessionStorage.__proto__, 'removeItem');
    removeItemSpy.mockImplementation(() => {});

    const ROUTES = { STORES: '/stores' };
    const messageFn = (location: { pathname: string }) => {
      const targetPage = ROUTES.STORES;
      const destination = location.pathname;
      if (destination !== targetPage) {
        sessionStorage.removeItem('storesPagination');
      }
      return true;
    };

    const locationMock = { pathname: '/altroPercorso' };
    const result = messageFn(locationMock);

    expect(removeItemSpy).toHaveBeenCalledWith('storesPagination');
    expect(result).toBe(true);

    removeItemSpy.mockRestore();
  });

  test('handlePromptMessage does not remove sessionStorage when staying in stores', () => {
    const spy = jest.spyOn(window.sessionStorage.__proto__, 'removeItem');
    mockHandlePromptMessage.mockImplementation(
      ({ pathname }: { pathname: string }, storesPath: string) => {
        if (pathname !== storesPath) {
          sessionStorage.removeItem('storesPagination');
        }
        return true;
      }
    );

    handlePromptMessage({ pathname: '/stores' }, '/stores');
    expect(spy).not.toHaveBeenCalled();
  });
});
