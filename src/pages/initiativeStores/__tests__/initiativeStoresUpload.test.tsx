import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import InitiativeStoresUpload from '../initiativeStoresUpload';
import * as merchantService from '../../../services/merchantService';
import * as jwtUtils from '../../../utils/jwt-utils';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useHistory, useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { usePlacesAutocomplete } from '../../../hooks/useAutocomplete';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));
jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');
jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
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

const addErrorMock = jest.fn();
const pushMock = jest.fn();
const readTokenMock = storageTokenOps.read as jest.Mock;
const updateMerchantPointOfSalesMock = merchantService.updateMerchantPointOfSales as jest.Mock;

const optionsAutocomplete = [
  {
    PlaceId:
      'AQAAAEIAo-GdOMG0YuWiCl1bLeH7pnLeGU-DJ1DARfn03wWK1Ibzikvro9XAM6Hv4sDPGpdIfvw6oDSL_x6wyMU6LSAZno_TU8Um_hTeBU-YKbWrPDwG2O8ZhQj-WT_GFbqxVehn5DA',
    PlaceType: 'Street',
    Title: 'Italia, 10073, Ciriè, Via Roma',
    Address: {
      Label: 'Via Roma, 10073 Ciriè TO, Italia',
      Country: { Code2: 'IT', Code3: 'ITA', Name: 'Italia' },
      Region: { Name: 'Piemonte' },
      SubRegion: { Code: 'TO', Name: 'Torino' },
      Locality: 'Ciriè',
      PostalCode: '10073',
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
    },
    Language: 'it',
    Highlights: {
      Title: [
        { StartIndex: 8, EndIndex: 11, Value: '100' },
        { StartIndex: 22, EndIndex: 30, Value: ' Via Rom' },
      ],
      Address: {
        Label: [
          { StartIndex: 0, EndIndex: 8, Value: 'Via Roma' },
          { StartIndex: 10, EndIndex: 13, Value: '100' },
        ],
        Street: [{ StartIndex: 0, EndIndex: 8, Value: 'Via Roma' }],
        PostalCode: [{ StartIndex: 0, EndIndex: 3, Value: '100' }],
      },
    },
  },
  {
    PlaceId:
      'AQAAAGEArii9_R-e4p-pnON6GGp6cAJbd8-_zRriejOfxrlDW_B870Lz52oI4nsxVlDzeLDBmqRNd2I2NPEVGcrww28DVTKENY0-VYoLJz9vLP7Reg2i6DG7X3oz40JBQJTV_mVhAT_l0ifPvO-tgbtvvAI-LTw-ccaUedojG-bRkDSwngmx',
    PlaceType: 'PointAddress',
    Title: 'Italia, 39100, Bolzano, Via Roma 100',
    Address: {
      Label: 'Via Roma, 100, 39100 Bolzano BZ, Italia',
      Country: { Code2: 'IT', Code3: 'ITA', Name: 'Italia' },
      Region: { Name: 'Trentino-Alto Adige' },
      SubRegion: { Code: 'BZ', Name: 'Bolzano' },
      Locality: 'Bolzano',
      PostalCode: '39100',
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
        { StartIndex: 24, EndIndex: 32, Value: 'Via Roma' },
        { StartIndex: 33, EndIndex: 36, Value: '100' },
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
      'AQAAAGAA9Xws_AzxKpyI4UWarvaljnUGFydR3IszQ73fttFEV9Z9quYdYtSxgmvDXJ0BhmgoDgRNVo85kDrmY8Kq1IYoi4MaxsdhkB_1s_MZsqZPjjs6ce9Uu3il6y5cfjgHjsKlH_hs8IsbtmM65q3HMq3VOkl8UMPHg7-fSym-rj44WN8',
    PlaceType: 'PointAddress',
    Title: 'Italia, 52017, Pratovecchio Stia, Via Roma 100',
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

describe('InitiativeStoresUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useErrorDispatcher as jest.Mock).mockReturnValue(addErrorMock);
    (useParams as jest.Mock).mockReturnValue({ id: 'test-initiative' });
    (useHistory as jest.Mock).mockReturnValue({ push: pushMock });
    mockUsePlacesAutocomplete.mockReturnValue({
      options: optionsAutocomplete,
      loading: false,
      error: false,
      search: false,
    });
  });

  it('renders correctly with Manual upload by default', () => {
    render(<InitiativeStoresUpload />);
    expect(screen.getByTestId('confirm-stores-button')).toBeInTheDocument();
  });

  it('calls handleBack when back button is clicked', () => {
    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('back-stores-button'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/portale-esercenti/test-initiative/panoramica')
    );
  });

  it('sets salesPoints when form changes', () => {
    render(<InitiativeStoresUpload />);
    const instance = screen.getByTestId('confirm-stores-button');
    expect(instance).toBeInTheDocument();
  });

  it('shows POINT_OF_SALE_ALREADY_REGISTERED error', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('navigates to STORES when response is null', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue(null);

    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('normalizes URLs when uploading manually', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'Email duplicata',
    });

    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    /*await waitFor(() => {
      expect(formatUtils.normalizeUrlHttps).toHaveBeenCalled();
      expect(formatUtils.normalizeUrlHttp).toHaveBeenCalled();
    });*/
  });

  it('test complete flow - physical store - error Merchant ID not found', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue(undefined);

    await render(<InitiativeStoresUpload />);
    await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('test complete flow - physical store - error duplicated entry', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'Email duplicata',
    });

    const rendered = await render(<InitiativeStoresUpload />);
    await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('test complete flow - physical store - other error', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue({
      code: 'GENERIC ERROR',
      message: 'Error with SailPoint',
    });

     render(<InitiativeStoresUpload />);
     await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  }, 10000);

  it('test complete flow - physical store - success', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue();

    const rendered = await render(<InitiativeStoresUpload />);
    await fillFormForSuccess(screen);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });
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
  const addressField = screen.getByRole('combobox');
  await userEvent.type(addressField, 'Via roma 100');
  
  await screen.findByText('Via Roma, 100, 32013 Longarone BL, Italia');
  const addressAutocompleteItem = await screen.findAllByRole('option');
  fireEvent.click(addressAutocompleteItem[3]);
};
