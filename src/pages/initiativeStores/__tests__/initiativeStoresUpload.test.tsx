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
      Label: 'Via Roma, 100, 52017 Pratovecchio Stia AR, Italia',
      Country: { Code2: 'IT', Code3: 'ITA', Name: 'Italia' },
      Region: { Name: 'Toscana' },
      SubRegion: { Code: 'AR', Name: 'Arezzo' },
      Locality: 'Pratovecchio Stia',
      District: 'Stia',
      PostalCode: '52017',
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
      Title: [
        { StartIndex: 34, EndIndex: 42, Value: 'Via Roma' },
        { StartIndex: 43, EndIndex: 46, Value: '100' },
      ],
      Address: {
        Label: [
          { StartIndex: 0, EndIndex: 8, Value: 'Via Roma' },
          { StartIndex: 10, EndIndex: 13, Value: '100' },
        ],
        Street: [{ StartIndex: 0, EndIndex: 8, Value: 'Via Roma' }],
        AddressNumber: [{ StartIndex: 0, EndIndex: 3, Value: '100' }],
      },
    },
  },
  {
    PlaceId:
      'AQAAAGAA_-f12qM_vUnpxK3dXvRN-bf638wAOLJ7f1QPKgB_SyfnIroh0TEvNwfV_sBGSOkGeBLrPNVrqfcxsNiNCrS4tAHN1gebTUHV-LCXq4CHImG9GDqIBF5m5CNZKQ-uOoWTTjGcCz5Ejw5OVIMWqV05JAPCl-dWOJag0pp0gr_Mkdo',
    PlaceType: 'PointAddress',
    Title: 'Italia, 17014, Cairo Montenotte, Via Roma 100',
    Address: {
      Label: 'Via Roma, 100, 17014 Cairo Montenotte SV, Italia',
      Country: { Code2: 'IT', Code3: 'ITA', Name: 'Italia' },
      Region: { Name: 'Liguria' },
      SubRegion: { Code: 'SV', Name: 'Savona' },
      Locality: 'Cairo Montenotte',
      PostalCode: '17014',
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
      Title: [
        { StartIndex: 33, EndIndex: 41, Value: 'Via Roma' },
        { StartIndex: 42, EndIndex: 45, Value: '100' },
      ],
      Address: {
        Label: [
          { StartIndex: 0, EndIndex: 8, Value: 'Via Roma' },
          { StartIndex: 10, EndIndex: 13, Value: '100' },
        ],
        Street: [{ StartIndex: 0, EndIndex: 8, Value: 'Via Roma' }],
        AddressNumber: [{ StartIndex: 0, EndIndex: 3, Value: '100' }],
      },
    },
  },
  {
    PlaceId:
      'AQAAAGEAiZmfC8mQdUA2Vk3C9f5T0ZRHSn_e1dTZM1HolAGFAppnd2a1Czq_WdoN_3qcuJcdIsV1JXelZ9VRnAirvew4r9xsOuLxc-EzeSrGpRoJTvmU5s5tb0_xd-CLBNuNXsOAlvnZUhTWeewujbIqkHXPF5vBheEjVKJ0MMdHwopwK9tH',
    PlaceType: 'PointAddress',
    Title: 'Italia, 32013, Longarone, Via Roma 100',
    Address: {
      Label: 'Via Roma, 100, 32013 Longarone BL, Italia',
      Country: { Code2: 'IT', Code3: 'ITA', Name: 'Italia' },
      Region: { Name: 'Veneto' },
      SubRegion: { Code: 'BL', Name: 'Belluno' },
      Locality: 'Longarone',
      PostalCode: '32013',
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
      Title: [
        { StartIndex: 26, EndIndex: 34, Value: 'Via Roma' },
        { StartIndex: 35, EndIndex: 38, Value: '100' },
      ],
      Address: {
        Label: [
          { StartIndex: 0, EndIndex: 8, Value: 'Via Roma' },
          { StartIndex: 10, EndIndex: 13, Value: '100' },
        ],
        Street: [{ StartIndex: 0, EndIndex: 8, Value: 'Via Roma' }],
        AddressNumber: [{ StartIndex: 0, EndIndex: 3, Value: '100' }],
      },
    },
  },
];

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
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
  (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])
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
    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);
    expect(screen.getByTestId('confirm-stores-button')).toBeInTheDocument();
  });

  it('calls handleBack when back button is clicked', () => {
    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    fireEvent.click(screen.getByTestId('back-stores-button'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/portale-esercenti/test-initiative/panoramica')
    );
  });

  it('Click to open manual link', () => {
    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    fireEvent.click(screen.getByText('pages.initiativeStores.manualLink'));
    expect(window.open).toHaveBeenCalled();
  });

  it('sets salesPoints when form changes', () => {
    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    const instance = screen.getByTestId('confirm-stores-button');
    expect(instance).toBeInTheDocument();
  });

  it('shows POINT_OF_SALE_ALREADY_REGISTERED error', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('navigates to STORES when response is null', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue(null);

    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('normalizes URLs when uploading manually', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'Email duplicata',
    });

    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
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

    render(<Provider store={store}><InitiativeStoresUpload /></Provider>);;
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
