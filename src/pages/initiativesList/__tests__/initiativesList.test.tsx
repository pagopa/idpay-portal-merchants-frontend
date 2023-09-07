import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { mockedInitiativesList } from '../../../api/__mocks__/MerchantsApiClient';
import { setInitiativesList, setSelectedInitative } from '../../../redux/slices/initiativesSlice';
import { store } from '../../../redux/store';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativesList from '../initiativesList';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for initiativeList page', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<InitiativesList />);
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

  test('User sorts initiatives by name', async () => {
    store.dispatch(setInitiativesList(mockedInitiativesList));
    renderWithContext(<InitiativesList />, store);
    const sortByName = screen.getByText('pages.initiativesList.initiativeName');
    fireEvent.click(sortByName);
  });

  test('Render an initiative with an unexpected data', () => {
    store.dispatch(
      setInitiativesList([
        ...mockedInitiativesList,
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
      ])
    );
    renderWithContext(<InitiativesList />, store);
  });

  test('User navigate to discounts list pege of an initiative', async () => {
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const { history } = renderWithContext(<InitiativesList />, store);
    const link = await screen.findByText('Iniziativa mock 1234');
    const oldLocationPathname = history.location.pathname;
    fireEvent.click(link);
    store.dispatch(
      setSelectedInitative({
        initiativeName: 'local tests initiative name',
        spendingPeriod: '2023/06/20 - 2023/06/26',
      })
    );
    await waitFor(() => expect(oldLocationPathname !== history.location.pathname).toBeTruthy());
  });
});
