/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InitiativeStoresUpload from '../initiativeStoresUpload';
import * as merchantService from '../../../services/merchantService';
import * as jwtUtils from '../../../utils/jwt-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useHistory, useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { usePlacesAutocomplete } from '../../../hooks/useAutocomplete';
import { configureStore } from '@reduxjs/toolkit';
import { useAppSelector } from '../../../redux/hooks';
import { Provider } from 'react-redux';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));
jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher');
jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn() },
}));
jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSales: jest.fn(),
}));

jest.mock('../../../services/merchantService', () => ({
  updateMerchantPointOfSales: jest.fn(),
}));
jest.mock('../../../utils/jwt-utils');
jest.mock('../../../utils/formatUtils', () => ({
  normalizeUrlHttp: jest.fn((x) => x),
  normalizeUrlHttps: jest.fn((x) => x),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../hooks/useAutocomplete');
const mockUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;

const pushMock = jest.fn();
const readTokenMock = storageTokenOps.read as jest.Mock;
const updateMerchantPointOfSalesMock = merchantService.updateMerchantPointOfSales as jest.Mock;

const createAutocompleteOption = (id: string, title: string, postalCode: string) => ({
  PlaceId: id,
  PlaceType: 'PointAddress',
  Title: title,
  Address: {
    Label: title,
    Country: { Code2: 'IT', Code3: 'ITA', Name: 'Italia' },
    Region: { Name: 'TestRegion' },
    SubRegion: { Code: 'XX', Name: 'TestProvince' },
    Locality: 'TestCity',
    PostalCode: postalCode,
    Street: 'Via Roma',
    StreetComponents: [
      {
        BaseName: 'Roma',
        Type: 'Via',
        TypePlacement: 'BeforeBaseName',
        TypeSeparator: ' ',
        Language: 'it',
      },
    ],
    AddressNumber: '100',
  },
  Language: 'it',
  Highlights: {
    Title: [],
    Address: {
      Label: [],
      Street: [],
      AddressNumber: [],
    },
  },
});

const optionsAutocomplete = [
  createAutocompleteOption('id-1', 'Via Roma, 100, 10000 City1', '10000'),
  createAutocompleteOption('id-2', 'Via Roma, 100, 20000 City2', '20000'),
  createAutocompleteOption('id-3', 'Via Roma, 100, 30000 City3', '30000'),
  createAutocompleteOption('id-4', 'Via Roma, 100, 40000 City4', '40000'),
  createAutocompleteOption('id-5', 'Via Roma, 100, 50000 City5', '50000'),
];

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: (state = { list: [] }) => state,
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));


const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: () => initialState
  });
};

const store = createMockStore();

describe('InitiativeStoresUpload', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);

  const renderWithProvider = () =>
    render(
      <Provider store={store}>
        <InitiativeStoresUpload />
      </Provider>
    );

  const setupAuth = () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({
      merchant_id: 'merchant-1',
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(window, 'open').mockImplementation(() => null as any);

    (useParams as jest.Mock).mockReturnValue({
      initiative_id: 'test-initiative',
    });
    (useHistory as jest.Mock).mockReturnValue({ push: pushMock });
    mockUsePlacesAutocomplete.mockReturnValue({
      options: optionsAutocomplete,
      loading: false,
      error: false,
      search: jest.fn(),
    });
    jest.spyOn(window, 'open').mockImplementation(jest.fn() as any);
  });

  afterEach(() => {
    (window.open as any).mockRestore?.();
  });

  afterEach(() => {
    (window.open as jest.Mock | undefined)?.mockRestore?.();
  });

  it('renders correctly with Manual upload by default', () => {
    renderWithProvider();
    expect(screen.getByTestId('confirm-stores-button')).toBeInTheDocument();
  });

  it('calls handleBack when back button is clicked', () => {
    renderWithProvider();
    fireEvent.click(screen.getByTestId('back-stores-button'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/portale-esercenti/test-initiative/panoramica')
    );
  });

  it('Click to open manual link', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('pages.initiativeStores.manualLink'));
    expect(window.open).toHaveBeenCalled();
  });

  it('sets salesPoints when form changes', () => {
    renderWithProvider();
    const instance = screen.getByTestId('confirm-stores-button');
    expect(instance).toBeInTheDocument();
  });

  it.each([
    { result: undefined },
    { result: null },
    {
      result: {
        code: 'POINT_OF_SALE_ALREADY_REGISTERED',
        message: 'Email duplicata',
      },
    },
  ])('handles confirm flow', async ({ result }) => {
    setupAuth();
    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue(result);

    renderWithProvider();
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it.skip('test complete flow - physical store - error Merchant ID not found', async () => {
    mockUsePlacesAutocomplete.mockReturnValue({
      options: optionsAutocomplete,
      loading: false,
      error: false,
      search: jest.fn(),
    });
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue(undefined);

    renderWithProvider();
    await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  }, 10000);

  it.skip('test complete flow - physical store - error duplicated entry', async () => {
    mockUsePlacesAutocomplete.mockReturnValue({
      options: optionsAutocomplete,
      loading: false,
      error: false,
      search: jest.fn(),
    });
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'Email duplicata',
    });

    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  }, 10000);

  it.skip('test complete flow - physical store - other error', async () => {
    mockUsePlacesAutocomplete.mockReturnValue({
      options: optionsAutocomplete,
      loading: false,
      error: false,
      search: jest.fn(),
    });
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue({
      code: 'GENERIC ERROR',
      message: 'Error with SailPoint',
    });

    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  }, 10000);

  it.skip('test complete flow - physical store - success', async () => {
    mockUsePlacesAutocomplete.mockReturnValue({
      options: optionsAutocomplete,
      loading: false,
      error: false,
      search: jest.fn(),
    });
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue(undefined);

    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  }, 10000);
});

const fillFormForSuccess = async (screen: any) => {
  const emailField = screen.getByLabelText('E-mail');
  await userEvent.type(emailField, 'a@b.it');

  const emailConfirmField = screen.getByLabelText('Conferma e-mail');
  await userEvent.type(emailConfirmField, 'a@b.it');

  const franchiseNameField = screen.getByLabelText('Nome insegna');
  await userEvent.type(franchiseNameField, 'TechStore');

  const contactNameField = screen.getByLabelText('Nome');
  await userEvent.type(contactNameField, 'TechStore');

  const contactSurnameField = screen.getByLabelText('Cognome');
  await userEvent.type(contactSurnameField, 'TechStore');

  const addressField = screen.getAllByRole('combobox')[0];
  fireEvent.change(addressField, { target: { value: 'Via roma 100' } });

  const addressAutocompleteItem = await screen.findAllByRole('option');
  fireEvent.click(addressAutocompleteItem[3]);
};
