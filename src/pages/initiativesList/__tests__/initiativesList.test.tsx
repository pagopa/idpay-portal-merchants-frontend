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

    expect(screen.getByText('pages.initiativesList.title')).toBeTruthy();
    expect(screen.getByText('pages.initiativesList.subtitle')).toBeTruthy();
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
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({
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
    } as any);

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    await screen.findByText('Bonus Decoder');

    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'Prova' } });

    await waitFor(() => {
      expect(screen.queryByText('Bonus Decoder')).toBeNull();
      expect(screen.getByText('Bonus Prova')).toBeTruthy();
    });
  });

  test('New initiatives tab keeps onboardable initiatives visible when a not-onboardable initiative exists', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({
      content: [
        {
          initiativeId: '1',
          initiativeName: 'Bonus Not Onboardable',
          organizationName: 'PagoPA',
          onboardStatus: 'NOT_ONBOARDABLE',
        },
        {
          initiativeId: '2',
          initiativeName: 'Bonus Onboardable',
          organizationName: 'PagoPA',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
    } as any);

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(await screen.findByText('Bonus Not Onboardable')).toBeTruthy();
    expect(screen.getByText('Bonus Onboardable')).toBeTruthy();
    expect(screen.queryByText('pages.initiativesList.emptyList')).toBeNull();
  });

  test('Reloads new initiatives tab when the tab is reopened and data exists', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({
      content: [
        {
          initiativeId: '1',
          initiativeName: 'Bonus Decoder',
          organizationName: 'PagoPA',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
    } as any);

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    expect(await screen.findByText('Bonus Decoder')).toBeTruthy();

    fireEvent.click(screen.getByTestId('merchant-initiatives-1'));
    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(mockedGetMerchantInitiativesAvailable).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Bonus Decoder')).toBeTruthy();
    expect(screen.queryByText('pages.initiativesList.emptyList')).toBeNull();
  });

  test('Search field is reset when user changes tab', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({ content: [] } as any);

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
    expect(screen.getByText('pages.initiativesList.newInitiativesLoadingTitle')).toBeTruthy();
    expect(screen.getByText('pages.initiativesList.newInitiativesLoadingSubtitle')).toBeTruthy();
  });

  test('Shows error feedback when new initiatives request fails', async () => {
    mockedGetMerchantInitiativesAvailable.mockRejectedValue(new Error('API error'));

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(await screen.findByText('pages.initiativesList.newInitiativesErrorTitle')).toBeTruthy();
    expect(screen.getByText('pages.initiativesList.newInitiativesErrorSubtitle')).toBeTruthy();
    expect(mockedGetMerchantInitiativesAvailable).toHaveBeenCalledTimes(1);
  });

  test('Shows empty feedback when new initiatives request succeeds with no results', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({ content: [] } as any);

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(await screen.findByText('pages.initiativesList.emptyList')).toBeTruthy();
    expect(screen.getByText('pages.initiativesList.newInitiativesEmptySubtitle')).toBeTruthy();
  });

  test('Shows success toast after onboarding API resolves', async () => {
    mockedGetMerchantInitiativesAvailable
      .mockResolvedValueOnce({
        content: [
          {
            initiativeId: '1',
            initiativeName: 'Bonus Decoder',
            organizationName: 'PagoPA',
            onboardStatus: 'ONBOARDABLE',
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        content: [
          {
            initiativeId: '2',
            initiativeName: 'Bonus Refresh',
            organizationName: 'PagoPA',
            onboardStatus: 'ONBOARDABLE',
          },
        ],
      } as any);
    mockedPutMerchantOnboardingRequest.mockResolvedValue({ status: 'APPROVED' } as any);

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    await screen.findByText('Bonus Decoder');

    fireEvent.click(screen.getByRole('button', { name: 'pages.initiativesList.actions.adhere' }));
    fireEvent.click(screen.getByTestId('onboarding-confirm-btn'));

    expect(await screen.findByTestId('alert')).toBeTruthy();
    expect(screen.getByText('pages.initiativesList.onboarding.successTitle')).toBeTruthy();
    expect(screen.getByTestId('merchant-initiatives-1').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('merchant-initiatives-2').getAttribute('aria-selected')).toBe('false');
    expect(mockedGetMerchantInitiativesAvailable).toHaveBeenCalledTimes(2);
  });

  test('Shows error toast after onboarding API rejects', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({
      content: [
        {
          initiativeId: '1',
          initiativeName: 'Bonus Decoder',
          organizationName: 'PagoPA',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
    } as any);
    mockedPutMerchantOnboardingRequest.mockRejectedValue(new Error('onboarding error'));

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    await screen.findByText('Bonus Decoder');

    fireEvent.click(screen.getByRole('button', { name: 'pages.initiativesList.actions.adhere' }));
    fireEvent.click(screen.getByTestId('onboarding-confirm-btn'));

    expect(await screen.findByTestId('alert')).toBeTruthy();
    expect(screen.getByText('pages.initiativesList.onboarding.errorTitle')).toBeTruthy();
  });

  test('User sorts initiatives by name', async () => {
    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);
    const sortByName = screen.getByText('pages.initiativesList.initiativeName');
    fireEvent.click(sortByName);
  });

  test('User sorts initiatives in the new initiatives tab by name', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({
      content: [
        {
          initiativeId: '1',
          initiativeName: 'Zeta Initiative',
          organizationName: 'PagoPA',
          onboardStatus: 'ONBOARDABLE',
        },
        {
          initiativeId: '2',
          initiativeName: 'Alpha Initiative',
          organizationName: 'PagoPA',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
    } as any);

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));
    await screen.findByText('Zeta Initiative');

    const sortByName = screen.getByText('pages.initiativesList.initiativeName');
    fireEvent.click(sortByName);

    const initiativeButtons = screen.getAllByRole('button', {
      name: /initiative/i,
    });

    expect(initiativeButtons[0]).toHaveTextContent('Zeta Initiative');
    expect(initiativeButtons[1]).toHaveTextContent('Alpha Initiative');

    fireEvent.click(sortByName);

    const sortedInitiativeButtons = screen.getAllByRole('button', {
      name: /initiative/i,
    });

    expect(sortedInitiativeButtons[0]).toHaveTextContent('Alpha Initiative');
    expect(sortedInitiativeButtons[1]).toHaveTextContent('Zeta Initiative');
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
