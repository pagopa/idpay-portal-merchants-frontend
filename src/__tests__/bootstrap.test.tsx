import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { MOCK_USER, testToken } from '../utils/constants';
import { ENV } from '../utils/env';
import ROUTES from '../routes';

// Mock all dependencies
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

jest.mock('../App', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../reportWebVitals', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../redux/store', () => ({
  store: { getState: jest.fn(), dispatch: jest.fn(), subscribe: jest.fn() },
}));

jest.mock('../consentAndAnalyticsConfiguration.ts', () => ({}));
jest.mock('../locale', () => ({}));

describe('bootstrap', () => {
  beforeEach(() => {
    // Reset CONFIG to initial state
    CONFIG.MOCKS.MOCK_USER = false;
    CONFIG.URL_FE.LOGIN = '';
    CONFIG.URL_FE.LOGOUT = '';
    CONFIG.URL_FE.ASSISTANCE = '';
    CONFIG.TEST.JWT = '';
    CONFIG.HEADER.LINK.PRODUCTURL = '';

    // Create a mock root element
    const mockRoot = document.createElement('div');
    mockRoot.id = 'root';
    document.body.appendChild(mockRoot);
  });

  afterEach(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      document.body.removeChild(rootElement);
    }
    jest.resetModules();
  });

  it('configures CONFIG with correct values', async () => {
    await import('../bootstrap');

    expect(CONFIG.MOCKS.MOCK_USER).toBe(MOCK_USER);
    expect(CONFIG.URL_FE.LOGIN).toBe(ENV.URL_FE.LOGIN);
    expect(CONFIG.URL_FE.LOGOUT).toBe(ENV.URL_FE.LOGOUT);
    expect(CONFIG.URL_FE.ASSISTANCE).toBe(ENV.URL_FE.ASSISTANCE_MERCHANT);
    expect(CONFIG.TEST.JWT).toBe(testToken);
    expect(CONFIG.HEADER.LINK.PRODUCTURL).toBe(ROUTES.HOME);
  });

  it('initializes the React application', async () => {
    const { createRoot } = require('react-dom/client');
    const mockRender = jest.fn();
    const mockCreateRoot = jest.fn(() => ({ render: mockRender }));
    (createRoot as jest.Mock).mockImplementation(mockCreateRoot);

    await import('../bootstrap');

    expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalledWith(expect.anything());
  });

  it('calls reportWebVitals', async () => {
    const reportWebVitals = require('../reportWebVitals').default;

    await import('../bootstrap');

    expect(reportWebVitals).toHaveBeenCalled();
  });
});
