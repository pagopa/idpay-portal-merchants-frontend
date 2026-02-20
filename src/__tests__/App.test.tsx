import App from '../App';
import '../locale';
import React from 'react';
import { renderWithContext } from '../utils/__tests__/test-utils';
import useTCAgreement from '../hooks/useTCAgreement';
import { createMemoryHistory } from 'history';

vi.mock('@pagopa/mui-italia', () => ({
  Footer: () => {},
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/portale-esercenti',
  }),
}));

const mockSignOutFn = vi.fn();

vi.mock('../services/rolePermissionService');
vi.mock('../decorators/withLogin');
vi.mock('../decorators/withSelectedPartyProducts');

vi.mock('../hooks/useTCAgreement');
const mockUseTCAgreement = useTCAgreement as vi.Mock;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
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
