import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as toolkit from '@reduxjs/toolkit';
import logger from 'redux-logger';

vi.mock('@reduxjs/toolkit', async () => {
  const actual = await vi.importActual<any>('@reduxjs/toolkit');
  return {
    ...actual,
    configureStore: vi.fn(),
  };
});

vi.mock('redux-logger', () => ({
  __esModule: true,
  default: 'mocked-logger',
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateReducer: vi.fn(),
}));
vi.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice', () => ({
  userReducer: vi.fn(),
}));
vi.mock('../slices/partiesSlice', () => ({ partiesReducer: vi.fn() }));
vi.mock('../slices/permissionsSlice', () => ({ permissionsReducer: vi.fn() }));
vi.mock('../slices/initiativesSlice', () => ({ initiativesReducer: vi.fn() }));

describe('Redux Store Configuration (Vitest ESM)', () => {
  const mockedConfigureStore = toolkit.configureStore as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should create store with combined reducers', async () => {
    await import('../store');

    expect(mockedConfigureStore).toHaveBeenCalledTimes(1);

    const config = mockedConfigureStore.mock.calls[0][0];
    expect(Object.keys(config.reducer)).toEqual([
      'user',
      'appState',
      'parties',
      'permissions',
      'initiatives',
    ]);
  });

  describe('Middleware configuration', () => {
    it('should NOT add logger when LOG_REDUX_ACTIONS is false', async () => {
      vi.doMock('../../utils/constants', () => ({
        LOG_REDUX_ACTIONS: false,
      }));

      await import('../store');

      const config = mockedConfigureStore.mock.calls[0][0];
      const middlewareCallback = config.middleware;

      const getDefaultMiddleware = vi.fn(() => ['default-middleware']);
      const finalMiddlewares = middlewareCallback(getDefaultMiddleware);

      expect(finalMiddlewares).not.toContain(logger);
      expect(finalMiddlewares).toEqual(['default-middleware']);
    });

    it('should add logger when LOG_REDUX_ACTIONS is true', async () => {
      vi.doMock('../../utils/constants', () => ({
        LOG_REDUX_ACTIONS: true,
      }));

      await import('../store');

      const config = mockedConfigureStore.mock.calls[0][0];
      const middlewareCallback = config.middleware;

      const getDefaultMiddleware = vi.fn(() => ['default-middleware']);
      const finalMiddlewares = middlewareCallback(getDefaultMiddleware);

      expect(finalMiddlewares).toContain(logger);
      expect(finalMiddlewares).toEqual(['default-middleware', 'mocked-logger']);
    });
  });
});
