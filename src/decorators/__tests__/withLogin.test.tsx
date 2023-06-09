import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/utils/storage';
// import { User } from '@pagopa/selfcare-common-frontend/model/User';
import { createStore } from '../../redux/store';
import withLogin from '../withLogin';
import { testToken } from '../../utils/constants';
import React from 'react';

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
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

// clean storage after each test
afterEach(() => {
  storageUserOps.delete();
  mockedLocation.assign.mockReset();
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
}));

const renderApp = () => {
  const store = createStore();
  const Component = () => <></>;
  const DecoratedComponent = withLogin(Component);
  render(
    <Provider store={store}>
      <DecoratedComponent />
    </Provider>
  );
  return store;
};

const mockUser = (): IDPayUser => {
  const user: IDPayUser = {
    name: 'NAME',
    surname: 'SURNAME',
    uid: 'UID',
    taxCode: 'AAAAAA00A00A000A',
    email: 'a@a.aa',
    org_party_role: 'ADMIN',
    org_role: 'admin',
  };

  storageUserOps.write(user);
  storageTokenOps.write(testToken);

  return user;
};

test('Test no auth session', async () => {
  renderApp();
  await waitFor(() => expect(global.window.location.assign).toBeCalledWith('/auth/login'));
});

test('Test auth session', async () => {
  const user = mockUser();
  const store = renderApp();
  await waitFor(() => {
    expect(global.window.location.assign).not.toBeCalled();
    expect(store.getState().user.logged).toMatchObject(user);
  });
});
