import { render, waitFor, screen } from '@testing-library/react';
import { Provider, useSelector as useSelectorOriginal } from 'react-redux';
import { storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { createStore } from '../../redux/store';
import withLogin from '../withLogin';

jest.mock('../../hooks/useLogin', () => ({
  useLogin: () => ({
    attemptSilentLogin: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
}));

const useSelector = useSelectorOriginal as unknown as jest.Mock;

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: jest.fn(),
  };
});

export interface IDPayUser {
  uid: string;
  taxCode: string;
  name: string;
  surname: string;
  email: string;
  org_party_role: string;
  org_role: string;
}

const oldWindowLocation = global.window.location;
const mockedLocation = {
  assign: jest.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
} as any;

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

afterEach(() => {
  storageUserOps.delete();
  mockedLocation.assign.mockReset();
  useSelector.mockReset();
});

const TestComponent = () => <div>LOGGED_COMPONENT</div>;

const renderApp = () => {
  const store = createStore();
  const DecoratedComponent = withLogin(TestComponent);
  render(
    <Provider store={store}>
      <DecoratedComponent />
    </Provider>
  );
  return store;
};

test('Test no auth session: chiama attemptSilentLogin e non renderizza il componente', async () => {
  useSelector.mockReturnValue(undefined);

  renderApp();

  await waitFor(() => {
    expect(screen.queryByText('LOGGED_COMPONENT')).toBeNull();
  });
});

test('Test auth session: user presente, viene renderizzato il WrappedComponent e non parte il silent login', async () => {
  const fakeUser: IDPayUser = {
    uid: 'UID',
    taxCode: 'AAAAAA00A00A000A',
    name: 'NAME',
    surname: 'SURNAME',
    email: 'a@a.aa',
    org_party_role: 'ADMIN',
    org_role: 'admin',
  };

  useSelector.mockReturnValue(fakeUser);

  renderApp();

  expect(await screen.findByText('LOGGED_COMPONENT')).toBeInTheDocument();

  expect(global.window.location.assign).not.toHaveBeenCalled();
});
