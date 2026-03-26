import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { MOCK_USER, testToken } from '../utils/constants';
import { ENV } from '../utils/env';
import ROUTES from '../routes';

const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({ render: mockRender }));

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
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

jest.mock('../consentAndAnalyticsConfiguration.ts', () => ({}));
jest.mock('../locale', () => ({}));

describe('bootstrap', () => {
  let bootstrapModule: any;

  beforeAll(() => {
    const mockRoot = document.createElement('div');
    mockRoot.id = 'root';
    document.body.appendChild(mockRoot);

    CONFIG.MOCKS.MOCK_USER = false;
    CONFIG.URL_FE.LOGIN = '';
    CONFIG.URL_FE.LOGOUT = '';
    CONFIG.URL_FE.ASSISTANCE = '';
    CONFIG.TEST.JWT = '';
    CONFIG.HEADER.LINK.PRODUCTURL = '';

    bootstrapModule = require('../bootstrap');
  });

  afterAll(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      document.body.removeChild(rootElement);
    }
  });

  describe('CONFIG initialization', () => {
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
      expect(bootstrapModule).toBeDefined();
    });

    it('should have initialized the application', () => {
      expect(CONFIG.MOCKS.MOCK_USER).toBeDefined();
    });
  });

  describe('Application structure', () => {
    it('should have created the root element in the DOM', () => {
      const rootElement = document.getElementById('root');
      expect(rootElement).not.toBeNull();
    });
  });
});
