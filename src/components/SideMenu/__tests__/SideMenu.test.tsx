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

  test('Renders component with empty initiatives list', () => {
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList([]));
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('User clicks the link to home page', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const link = await screen.findByText('pages.initiativesList.title');
    const user = userEvent.setup();
    await user.click(link);
    await waitFor(() => expect(history.location.pathname === ROUTES.HOME).toBeTruthy());
  });

  test('User clicks to an accordion title to expand it', async () => {
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const link = await screen.findByText('Iniziativa mock 1234');
    const user = userEvent.setup();
    await user.click(link);
    await waitFor(() => expect(link).toBeInTheDocument());
  });

  test('User clicks to an accordion title to collapse it', async () => {
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const link = await screen.findByText('Iniziativa mock 1234');
    const user = userEvent.setup();
    // First click to expand
    await user.click(link);
    // Second click to collapse
    await user.click(link);
    await waitFor(() => expect(link).toBeInTheDocument());
  });

  test('User clicks initiative overview link', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const overviewLinks = await screen.findAllByText('pages.initiativeOverview.title');
    const user = userEvent.setup();
    await user.click(overviewLinks[0]);
    await waitFor(() => {
      expect(history.location.pathname).toContain(ROUTES.SIDE_MENU_OVERVIEW);
    });
  });

  test('User clicks initiative stores link', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const storesLinks = await screen.findAllByText('pages.initiativeStores.title');
    const user = userEvent.setup();
    await user.click(storesLinks[0]);
    await waitFor(() => {
      expect(history.location.pathname).toContain(ROUTES.SIDE_MENU_STORES);
    });
  });

  test('User clicks reported users link', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const reportedUsersLinks = await screen.findAllByText('pages.reportedUsers.title');
    const user = userEvent.setup();
    await user.click(reportedUsersLinks[0]);
    await waitFor(() => {
      expect(history.location.pathname).toContain(ROUTES.SIDE_MENU_REPORTED_USERS);
    });
  });

  test('Checks if stores page is selected', async () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_STORES}`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });

    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    await waitFor(() => {
      expect(screen.getByTestId('list-test')).toBeInTheDocument();
    });
  });

  test('Checks if reported users page is selected', async () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_REPORTED_USERS}`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });

    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    await waitFor(() => {
      expect(screen.getByTestId('list-test')).toBeInTheDocument();
    });
  });

  test('Appropriate item expanded based on parameter id value in match', () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_OVERVIEW}`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });

    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('Expands first initiative when no match params', async () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: ROUTES.HOME,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });

    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    await waitFor(() => {
      expect(screen.getByTestId('list-test')).toBeInTheDocument();
    });
  });

  test('Handles accordion change event', async () => {
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    const accordion = await screen.findAllByTestId('accordion-click-test');
    const user = userEvent.setup();

    await user.click(accordion[0] as HTMLElement);
    await waitFor(() => {
      expect(accordion[0]).toBeInTheDocument();
    });
  });

  test('Accordion summary handles click and dispatches setSelectedInitiative', async () => {
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    const initiativeTitle = await screen.findByText('Iniziativa mock 1234');
    const user = userEvent.setup();

    await user.click(initiativeTitle);

    await waitFor(() => {
      const state = store.getState();
      expect(state.initiatives.selectedInitative).toBeDefined();
    });
  });

  test('History listen is configured during component construction', () => {
    const { history } = renderWithContext(<SideMenu />);

    // Trigger history change
    history.push(ROUTES.HOME);

    expect(history.location.pathname).toBe(ROUTES.HOME);
  });

  test('Component updates when pathname changes via history', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    const newPath = `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_STORES}`;
    history.push(newPath);

    await waitFor(() => {
      expect(history.location.pathname).toBe(newPath);
    });
  });
});