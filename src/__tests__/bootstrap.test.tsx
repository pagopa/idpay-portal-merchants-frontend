const mockRender = jest.fn();
const mockCreateRoot = jest.fn((..._args: Array<unknown>) => ({ render: mockRender }));

jest.mock('react-dom/client', () => ({
  __esModule: true,
  createRoot: (...args: Array<unknown>) => mockCreateRoot(...(args as [unknown])),
}));

jest.mock('../utils/env', () => ({
  ENV: {
    URL_FE: {
      LOGIN: 'https://selfcare/auth/login',
      LOGOUT: 'https://selfcare/auth/logout',
      ASSISTANCE_MERCHANT: 'https://selfcare/assistance',
    },
  },
}));

jest.mock('../routes', () => ({
  __esModule: true,
  default: { HOME: '/portale-esercenti' },
}));

jest.mock('../App', () => ({
  __esModule: true,
  default: () => null,
}));

const mockReportWebVitals = jest.fn();
jest.mock('../reportWebVitals', () => ({
  __esModule: true,
  default: mockReportWebVitals,
}));

jest.mock('../redux/store', () => ({
  store: { getState: jest.fn(), dispatch: jest.fn(), subscribe: jest.fn() },
}));

jest.mock('../consentAndAnalyticsConfiguration', () => ({}));
jest.mock('../locale', () => ({}));

import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { MOCK_USER, testToken } from '../utils/constants';
import ROUTES from '../routes';
import { ENV } from '../utils/env';

describe('bootstrap', () => {
  let bootstrapModule: any;

  const importBootstrapIsolated = (): void => {
    jest.isolateModules(() => {
      bootstrapModule = require('../bootstrap');
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateRoot.mockImplementation(() => ({ render: mockRender }));
    document.body.innerHTML = '<div id="root"></div>';

    CONFIG.MOCKS.MOCK_USER = false;
    CONFIG.URL_FE.LOGIN = 'https://selfcare/auth/login';
    CONFIG.URL_FE.LOGOUT = 'https://selfcare/auth/logout';
    CONFIG.URL_FE.ASSISTANCE = 'https://selfcare/assistance';
    CONFIG.TEST.JWT = '';
    CONFIG.HEADER.LINK.PRODUCTURL = '/portale-esercenti';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('CONFIG initialization', () => {
    beforeEach(() => {
      importBootstrapIsolated();
    });

    it('should set MOCK_USER correctly', () => {
      expect(CONFIG.MOCKS.MOCK_USER).toBe(MOCK_USER);
    });

    it('should set URL_FE.LOGIN correctly', () => {
      expect(CONFIG.URL_FE.LOGIN).toBe(ENV.URL_FE.LOGIN);
    });

    it('should set URL_FE.LOGOUT correctly', () => {
      expect(CONFIG.URL_FE.LOGOUT).toBe(ENV.URL_FE.LOGOUT);
    });

    it('should set URL_FE.ASSISTANCE correctly', () => {
      expect(CONFIG.URL_FE.ASSISTANCE).toBe(ENV.URL_FE.ASSISTANCE_MERCHANT);
    });

    it('should set TEST.JWT correctly', () => {
      expect(CONFIG.TEST.JWT).toBe(testToken);
    });

    it('should set HEADER.LINK.PRODUCTURL correctly', () => {
      expect(CONFIG.HEADER.LINK.PRODUCTURL).toBe(ROUTES.HOME);
    });
  });

  describe('React application bootstrapping', () => {
    it('should successfully import and execute bootstrap module', () => {
      importBootstrapIsolated();

      expect(bootstrapModule).toBeDefined();
      expect(CONFIG.MOCKS.MOCK_USER).toBe(MOCK_USER);
      expect(CONFIG.URL_FE.LOGIN).toBe(ENV.URL_FE.LOGIN);
      expect(CONFIG.URL_FE.LOGOUT).toBe(ENV.URL_FE.LOGOUT);
      expect(CONFIG.URL_FE.ASSISTANCE).toBe(ENV.URL_FE.ASSISTANCE_MERCHANT);
      expect(CONFIG.TEST.JWT).toBe(testToken);
      expect(CONFIG.HEADER.LINK.PRODUCTURL).toBe(ROUTES.HOME);
      expect(mockCreateRoot).toHaveBeenCalledWith(expect.any(HTMLElement));
      expect(mockRender).toHaveBeenCalled();
      expect(mockReportWebVitals).toHaveBeenCalled();
    });

    it('should have initialized the application', () => {
      importBootstrapIsolated();
      expect(CONFIG.MOCKS.MOCK_USER).toBeDefined();
    });
  });

  describe('Application structure', () => {
    it('should have created the root element in the DOM', () => {
      expect(document.getElementById('root')).not.toBeNull();
    });
  });
});
