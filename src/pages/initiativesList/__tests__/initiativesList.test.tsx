/// <reference types="jest" />
import { beforeEach, describe, expect, test } from '@jest/globals';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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

jest.mock('../../../services/merchantService', () => {
  const actualMerchantService = jest.requireActual('../../../services/merchantService');

  return {
    ...actualMerchantService,
    getMerchantInitiativesAvailable: jest.fn(),
    putMerchantOnboardingRequest: jest.fn(),
  };
});

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
  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;

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

  test('New initiatives request normalizes array response and ignores invalid items', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue([
      null,
      {
        initiativeId: 'raw-initiative-id',
        initiativeName: 'Raw Initiative',
        organizationName: 'Raw Org',
        onboardStatus: 'ONBOARDABLE',
      },
    ] as any);

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(await screen.findByText('Raw Initiative')).toBeTruthy();
    expect(screen.queryByText('pages.initiativesList.emptyList')).toBeNull();
  });

  test('New initiatives mapping handles missing fields with safe fallbacks', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({
      content: [
        {},
        {
          initiativeId: 'visible-id',
          initiativeName: 'Visible Initiative',
          organizationName: 'Visible Org',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
    } as any);

    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    expect(await screen.findByText('Visible Initiative')).toBeTruthy();
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

  test('Switching to new initiatives tab resets sort when current column is not supported', async () => {
    mockedGetMerchantInitiativesAvailable.mockResolvedValue({
      content: [
        {
          initiativeId: 'new-initiative-1',
          initiativeName: 'New Initiative',
          organizationName: 'PagoPA',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
    } as any);

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);

    fireEvent.click(screen.getByText('pages.initiativesList.initiativeStatus'));
    fireEvent.click(screen.getByTestId('merchant-initiatives-2'));

    await screen.findByText('New Initiative');

    const getVisibleTabPanel = () =>
      screen.getAllByRole('tabpanel').find((panel) => !panel.hasAttribute('hidden')) as HTMLElement;

    expect(await within(getVisibleTabPanel()).findByText('sorted ascending')).toBeTruthy();
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

    const getVisibleTabPanel = () =>
      screen.getAllByRole('tabpanel').find((panel) => !panel.hasAttribute('hidden')) as HTMLElement;

    const sortByName = within(getVisibleTabPanel()).getByText(
      'pages.initiativesList.initiativeName'
    );

    const getRenderedInitiativeNames = () =>
      within(getVisibleTabPanel())
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.querySelector('td')?.textContent?.trim());

    fireEvent.click(sortByName);

    if (getRenderedInitiativeNames()[0] !== 'Alpha Initiative') {
      fireEvent.click(within(getVisibleTabPanel()).getByText('pages.initiativesList.initiativeName'));
    }

    await waitFor(() => {
      expect(getRenderedInitiativeNames()).toEqual(['Alpha Initiative', 'Zeta Initiative']);
    });
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

  test('Render initiative without creationDate', () => {
    store.dispatch(
      setInitiativesList([
        {
          enabled: true,
          initiativeId: 'no-date-id',
          initiativeName: 'No date initiative',
          organizationName: 'No date org',
          serviceId: 'no-date-service',
          status: 'PUBLISHED',
        },
      ] as Array<any>)
    );

    renderWithContext(<InitiativesList />, store);

    expect(screen.getByText('No date initiative')).toBeTruthy();
  });

  test('Render initiative with creationDate formatted in spending period column', () => {
    store.dispatch(
      setInitiativesList([
        {
          enabled: true,
          initiativeId: 'with-date-id',
          initiativeName: 'With date initiative',
          organizationName: 'With date org',
          serviceId: 'with-date-service',
          status: 'PUBLISHED',
          creationDate: '2024-01-15T00:00:00.000Z',
        },
      ] as Array<any>)
    );

    renderWithContext(<InitiativesList />, store);

    expect(screen.getByText('With date initiative')).toBeTruthy();
    expect(screen.getByText('15/01/2024')).toBeTruthy();
  });

  test('User navigate to discounts list pege of an initiative', () => {
    const history = createMemoryHistory();

    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store, history);

    fireEvent.click(screen.getAllByTestId('initiative-btn-test')[0]);

    expect(history.location.pathname).toContain('/panoramica');
  });
});
