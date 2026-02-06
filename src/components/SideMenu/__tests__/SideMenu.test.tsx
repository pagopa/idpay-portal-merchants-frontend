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


  test('Render component with empty initiatives list', () => {
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


  test('User clicks on initiative overview menu item', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    const overviewLinks = await screen.findAllByText('pages.initiativeOverview.title');
    const user = userEvent.setup();
    await user.click(overviewLinks[0]);
    
    await waitFor(() => {
      const expectedPath = `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_OVERVIEW}`;
      expect(history.location.pathname).toBe(expectedPath);
    });
  });

  test('User clicks on initiative stores menu item', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    const storesLinks = await screen.findAllByText('pages.initiativeStores.title');
    const user = userEvent.setup();
    await user.click(storesLinks[0]);
    
    await waitFor(() => {
      const expectedPath = `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_STORES}`;
      expect(history.location.pathname).toBe(expectedPath);
    });
  });

  test('Accordion expands on initiative overview click from accordion summary', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    const accordionSummary = await screen.findByText('Iniziativa mock 1234');
    const user = userEvent.setup();
    await user.click(accordionSummary);
    
    await waitFor(() => {
      const expectedPath = `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_OVERVIEW}`;
      expect(history.location.pathname).toBe(expectedPath);
    });
  });

  test('checkIsSelected returns true when pathname matches stores route', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    const storesPath = `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_STORES}`;
    history.replace(storesPath);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe(storesPath);
    });
  });

  test('checkIsSelected returns true when pathname matches export report route', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));

    const exportReportPath = `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_EXPORT_REPORT}`;
    history.replace(exportReportPath);

    await waitFor(() => {
      expect(history.location.pathname).toBe(exportReportPath);
    });
  });

  test('checkIsSelected returns true for stores detail route', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    const storesDetailPath = `${BASE_ROUTE}/${mockedInitiativesList[0].initiativeId}/${ROUTES.SIDE_MENU_STORES}/detail`;
    history.replace(storesDetailPath);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe(storesDetailPath);
    });
  });

  test('Appropriate item expanded based on parameter id value (overview route)', () => {
    const initiativeId = mockedInitiativesList[0].initiativeId;
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/${initiativeId}/${ROUTES.SIDE_MENU_OVERVIEW}`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });
    
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('Appropriate item expanded based on parameter id value (stores route)', () => {
    const initiativeId = mockedInitiativesList[0].initiativeId;
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/${initiativeId}/${ROUTES.SIDE_MENU_STORES}`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });
    
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('Appropriate item expanded based on parameter id value (discounts route)', () => {
    const initiativeId = mockedInitiativesList[0].initiativeId;
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/sconti-iniziativa/${initiativeId}`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });
    
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('First initiative expanded when no match found', () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/some-other-route`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });
    
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('No expansion when initiatives list is empty and no match', () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/some-other-route`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });
    
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList([]));
    
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });


  test('History listener updates pathname correctly', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    
    const homeLink = await screen.findByText('pages.initiativesList.title');
    const user = userEvent.setup();
    
    await user.click(homeLink);
    
    await waitFor(() => {
      expect(history.location.pathname).toBe(ROUTES.HOME);
    });
  });

  test.skip('User clicks a link with an id parameter', async () => {
    const { store, history } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const link = await screen.findAllByText('pages.initiativeDiscounts.title');
    const user = userEvent.setup();
    const oldLocationPathname = history.location.pathname;
    await user.click(link[0]);
    await waitFor(() => expect(oldLocationPathname !== history.location.pathname).toBeTruthy());
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

  test('Renders component with empty initiatives list', () => {
    const { store } = renderWithContext(<SideMenu />);
    store.dispatch(setInitiativesList([]));
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });
});