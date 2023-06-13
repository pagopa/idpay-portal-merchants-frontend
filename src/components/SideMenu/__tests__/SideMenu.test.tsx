import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import SideMenu from '../SideMenu';
import { setInitiativesList } from '../../../redux/slices/initiativesSlice';
import { mockedInitiativesList } from '../../../api/__mocks__/MerchantsApiClient';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ROUTES, { BASE_ROUTE } from '../../../routes';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for SideMenu component', () => {
  test('Render component', () => {
    renderWithContext(<SideMenu />);
  });

  test('User clicks the link to home page', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const link = await screen.findByText('pages.initiativesList.title');
    const user = userEvent.setup();
    await user.click(link);
    await waitFor(() => expect(history.location.pathname === ROUTES.HOME).toBeTruthy());
  });

  test('User clicks to an accordion title to collapse it', async () => {
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const link = await screen.findByText('Iniziativa mock 1234');
    const user = userEvent.setup();
    await user.click(link);
    await waitFor(() => expect(link.ariaExpanded).toBeFalsy());
  });

  test('User clicks a link with an id parameter', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const link = await screen.findAllByText('pages.initiativeDiscounts.title');
    const user = userEvent.setup();
    const oldLocationPathname = history.location.pathname;
    await user.click(link[0]);
    await waitFor(() => expect(oldLocationPathname !== history.location.pathname).toBeTruthy());
  });

  test('Appropriate item expanded based on parameter id value', () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/sconti-iniziativa/1234`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });
    renderWithContext(<SideMenu />);
  });
});
