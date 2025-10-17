import App from '../App';
import '../locale';
import React from 'react';
import { renderWithContext } from '../utils/__tests__/test-utils';
import useTCAgreement from '../hooks/useTCAgreement';
import { createMemoryHistory } from 'history';

jest.mock('@pagopa/mui-italia/dist/components/Footer/Footer', () => ({
  Footer: () => {},
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/portale-esercenti',
  }),
}));

const mockSignOutFn = jest.fn();

jest.mock('../services/rolePermissionService');
jest.mock('../decorators/withLogin');
jest.mock('../decorators/withSelectedPartyProducts');

jest.mock('../hooks/useTCAgreement');
const mockUseTCAgreement = useTCAgreement as jest.Mock;

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Test suite for App component', () => {
  test('Render App with TOS accepted', () => {
    mockUseTCAgreement.mockReturnValue({
      isTOSAccepted: undefined,
      acceptTOS: mockSignOutFn,
      firstAcceptance: true,
    });
    renderWithContext(<App />);
  });

  test('Render App with TOS not accepted', () => {
    mockUseTCAgreement.mockReturnValue({
      isTOSAccepted: false,
      acceptTOS: mockSignOutFn,
      firstAcceptance: false,
    });
    renderWithContext(<App />);
  });

  test('Render App with TOS accepted', () => {
    mockUseTCAgreement.mockReturnValue({
      isTOSAccepted: true,
      acceptTOS: mockSignOutFn,
      firstAcceptance: false,
    });
    renderWithContext(<App />);
  });

  test('Render App with MemoryHistory', () => {
    mockUseTCAgreement.mockReturnValue({
      isTOSAccepted: true,
      acceptTOS: mockSignOutFn,
      firstAcceptance: false,
    });
    const memoryHistory = createMemoryHistory();
    renderWithContext(<App />, undefined, memoryHistory);
  });
});
