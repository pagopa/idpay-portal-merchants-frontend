import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { mockedInitiativesList } from '../../../api/__mocks__/MerchantsApiClient';
import { setInitiativesList } from '../../../redux/slices/initiativesSlice';
import { store } from '../../../redux/store';
import {
  getMerchantInitiativesAvailable,
  putMerchantOnboardingRequest,
} from '../../../services/merchantService';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativesList from '../initiativesList';

jest.mock('../../../services/merchantService', () => ({
  ...jest.requireActual('../../../services/merchantService'),
  getMerchantInitiativesAvailable: jest.fn(),
  putMerchantOnboardingRequest: jest.fn(),
}));

const mockedGetMerchantInitiativesAvailable = jest.mocked(getMerchantInitiativesAvailable);
const mockedPutMerchantOnboardingRequest = jest.mocked(putMerchantOnboardingRequest);

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockedGetMerchantInitiativesAvailable.mockReset();
  mockedPutMerchantOnboardingRequest.mockReset();
  store.dispatch(setInitiativesList([] as Array<any>));
});

describe('Test suite for initiativeList page', () => {
  window.scrollTo = jest.fn();

  test('Render component', () => {
    renderWithContext(<InitiativesList />);

    expect(screen.getByText('pages.initiativesList.title')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativesList.subtitle')).toBeInTheDocument();
  });

  test('User searches an initiative by name that shows results', async () => {
    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'Iniziativa mock 1234' } });
    expect(searchField.value).toBe('Iniziativa mock 1234');
  });

  test("User searches an initiative by name that doesn't show results", async () => {
    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'not present' } });
    expect(searchField.value).toBe('not present');
  });

  test('User resets previous search', async () => {
    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'previous value' } });
    fireEvent.change(searchField, { target: { value: '' } });
    expect(searchField.value).toBe('');
  });

  test('User searches initiatives in the new initiatives tab', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue([
      {
        content: [
          {
            initiativeId: '1',
            initiativeName: 'Bonus Decoder',
            organizationName: 'PagoPA',
            onboardStatus: 'ONBOARDABLE',
          },
          {
            initiativeId: '2',
            initiativeName: 'Bonus Prova',
            organizationName: 'PagoPA',
            onboardStatus: 'ONBOARDABLE',
          },
        ],
      },
    ] as Array<any>);

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    await screen.findByText('Bonus Decoder');

    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'Prova' } });

    await waitFor(() => {
      expect(screen.queryByText('Bonus Decoder')).not.toBeInTheDocument();
      expect(screen.getByText('Bonus Prova')).toBeInTheDocument();
    });
  });

  test('Search field is reset when user changes tab', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue([] as Array<any>);

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);

    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'Iniziativa mock 1234' } });
    expect(searchField.value).toBe('Iniziativa mock 1234');

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    expect(searchField.value).toBe('');
  });

  test('Shows loading feedback while new initiatives request is pending', async () => {
    mockedGetMerchantInitiativesAvailable.mockImplementation(
      () => new Promise(() => undefined) as Promise<Array<any>>
    );

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    fireEvent.click(screen.getByTestId('merchant-initiatives-1'));
    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(mockedGetMerchantInitiativesAvailable).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText('pages.initiativesList.newInitiativesLoadingTitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativesList.newInitiativesLoadingSubtitle')
    ).toBeInTheDocument();
  });

  test('Shows error feedback when new initiatives request fails', async () => {
    mockedGetMerchantInitiativesAvailable.mockRejectedValue(new Error('API error'));

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(
      await screen.findByText('pages.initiativesList.newInitiativesErrorTitle')
    ).toBeInTheDocument();
    expect(screen.getByText('pages.initiativesList.newInitiativesErrorSubtitle')).toBeInTheDocument();
    expect(mockedGetMerchantInitiativesAvailable).toHaveBeenCalledTimes(1);
  });

  test('Shows empty feedback when new initiatives request succeeds with no results', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue([
      {
        content: [],
      },
    ] as Array<any>);

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(await screen.findByText('pages.initiativesList.emptyList')).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativesList.newInitiativesEmptySubtitle')
    ).toBeInTheDocument();
  });

  test('Shows success toast after onboarding API resolves', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue([
      {
        content: [
          {
            initiativeId: '1',
            initiativeName: 'Bonus Decoder',
            organizationName: 'PagoPA',
            onboardStatus: 'ONBOARDABLE',
          },
        ],
      },
    ] as Array<any>);
    mockedPutMerchantOnboardingRequest.mockResolvedValue({ status: 'APPROVED' } as any);

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    await screen.findByText('Bonus Decoder');

    fireEvent.click(screen.getByRole('button', { name: 'pages.initiativesList.actions.adhere' }));
    fireEvent.click(screen.getByTestId('onboarding-confirm-btn'));

    expect(await screen.findByTestId('alert')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativesList.onboarding.successTitle')).toBeInTheDocument();
  });

  test('Shows error toast after onboarding API rejects', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue([
      {
        content: [
          {
            initiativeId: '1',
            initiativeName: 'Bonus Decoder',
            organizationName: 'PagoPA',
            onboardStatus: 'ONBOARDABLE',
          },
        ],
      },
    ] as Array<any>);
    mockedPutMerchantOnboardingRequest.mockRejectedValue(new Error('onboarding error'));

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    await screen.findByText('Bonus Decoder');

    fireEvent.click(screen.getByRole('button', { name: 'pages.initiativesList.actions.adhere' }));
    fireEvent.click(screen.getByTestId('onboarding-confirm-btn'));

    expect(await screen.findByTestId('alert')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativesList.onboarding.errorTitle')).toBeInTheDocument();
  });

  test('User sorts initiatives by name', async () => {
    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);
    const sortByName = screen.getByText('pages.initiativesList.initiativeName');
    fireEvent.click(sortByName);
  });

  test('Render initiatives with different statuses and unexpected data', () => {
    store.dispatch(
      setInitiativesList([
        ...mockedInitiativesList,
        {
          enabled: true,
          endDate: undefined,
          initiativeId: 'closed-id',
          initiativeName: 'Closed initiative',
          organizationName: 'Closed org',
          serviceId: 'closed-service',
          startDate: undefined,
          status: 'CLOSED',
        },
        {
          enabled: true,
          endDate: undefined,
          initiativeId: '',
          initiativeName: '',
          organizationName: '',
          serviceId: '',
          startDate: undefined,
          status: undefined,
        },
      ] as Array<any>)
    );
    renderWithContext(<InitiativesList />, store);
  });

  test('User navigate to discounts list pege of an initiative', () => {
    const history = createMemoryHistory();

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store, history);
  });
});
