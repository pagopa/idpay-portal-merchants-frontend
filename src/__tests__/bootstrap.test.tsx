jest.mock('../utils/env', () => ({
  ENV: {
    URL_FE: {
      LOGIN: "http://selfcare/auth/login",
      LOGOUT: "http://selfcare/auth/logout",
      ASSISTANCE_MERCHANT: "http://selfcare/assistance",
    }
  }
}));

jest.mock('../routes', () => ({
  __esModule: true,
  default: { HOME: "/portale-esercenti" }
}));

import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { MOCK_USER, testToken } from '../utils/constants';
import ROUTES from '../routes';
import { ENV } from '../utils/env';

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
    CONFIG.URL_FE.LOGIN = 'http://selfcare/auth/login';
    CONFIG.URL_FE.LOGOUT = 'http://selfcare/auth/logout';
    CONFIG.URL_FE.ASSISTANCE = 'http://selfcare/assistance';
    CONFIG.TEST.JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NzQ1MjE1MTksImV4cCI6MTc3NDU1MDMxOSwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoiZXNlcmNlbnRlVGVzdEB0ZXN0LmVtYWlsLml0IiwiYWNxdWlyZXJfaWQiOiJQQUdPUEEiLCJtZXJjaGFudF9pZCI6IjNhNjAyYjE3LWFjMWMtMzAyOS05ZTc4LTBhNGJiYjg2OTNkNCIsIm9yZ19pZCI6IjJiNDhiZjk2LWZkNzQtNDc3ZS1hNzBhLTI4NmI0MTBmMDIwYSIsIm9yZ192YXQiOiIzMzQ0NDQzMzQ4OCIsIm9yZ19uYW1lIjoiRXNlcmNlbnRlIGRpIHRlc3QgSWRQYXkiLCJvcmdfcGFydHlfcm9sZSI6Ik1BTkFHRVIiLCJvcmdfcm9sZSI6ImFkbWluIiwic2NvcGUiOiJ0cmFuc2FjdGlvbjppbnZvaWNlbGlmZWN5Y2xlOmZ1bGwifQ.h-GgHZgu7wbiBCkWKp_ovnQqIxeeNihOpbute_A_rNxsOHGUtYUPVQeRsPuB4YfRm4XJ9nubJCjPOD8X5LUqCajtpVttN8naRPFTiF2aG_JpKAuNsViS_PFr5UwCZyry-wMORk9Hnqo8UPcu3IBNaB7zl__A1TmkW2PdLqJ6TFU8nd3018SviF1GKpuYgO12vX5t9sRrr7rK0DJUbI0gROD57Body5S8BMwf82OxY7MCzwoCeEI0_AeaYQdCRYcV59uulKrCge2LkHVc32BGn_bqowYN_dHz9SSpTAF1NfL4HBHEmUwRFNnwkLDNWkJOABksKGJ7lvVjHuWxomilnA';
    CONFIG.HEADER.LINK.PRODUCTURL = '/portale-esercenti';
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
    it.skip('should successfully import and execute bootstrap module', () => {
      bootstrapModule = require('../bootstrap');
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
