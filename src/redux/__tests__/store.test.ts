import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

jest.mock('@reduxjs/toolkit', () => ({
  ...jest.requireActual('@reduxjs/toolkit'),
  configureStore: jest.fn(),
}));

jest.mock('redux-logger', () => ({
  __esModule: true,
  default: 'mocked-logger',
}));

jest.mock('@pagopa/selfcare-common-frontend/redux/slices/appStateSlice', () => ({
  appStateReducer: jest.fn(),
}));
jest.mock('@pagopa/selfcare-common-frontend/redux/slices/userSlice', () => ({
  userReducer: jest.fn(),
}));
jest.mock('../slices/partiesSlice', () => ({ partiesReducer: jest.fn() }));
jest.mock('../slices/permissionsSlice', () => ({ permissionsReducer: jest.fn() }));
jest.mock('../slices/initiativesSlice', () => ({ initiativesReducer: jest.fn() }));

describe('Redux Store Configuration', () => {
  const mockedConfigureStore = configureStore as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dovrebbe creare uno store con tutti i reducer combinati correttamente', () => {
    require('../store');

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

  describe('Configurazione del Middleware', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('dovrebbe configurare i middleware di default senza il logger se LOG_REDUX_ACTIONS è false', () => {
      jest.mock('../../utils/constants', () => ({
        LOG_REDUX_ACTIONS: false,
      }));

      const localMockedConfigureStore = require('@reduxjs/toolkit').configureStore;

      require('../store');

      const config = localMockedConfigureStore.mock.calls[0][0];
      const middlewareCallback = config.middleware;

      const getDefaultMiddleware = jest.fn(() => ['default-middleware']);
      const finalMiddlewares = middlewareCallback(getDefaultMiddleware);

      expect(finalMiddlewares).not.toContain(logger);
      expect(finalMiddlewares).toEqual(['default-middleware']);
    });

    it('dovrebbe aggiungere il logger ai middleware di default se LOG_REDUX_ACTIONS è true', () => {
      jest.mock('../../utils/constants', () => ({
        LOG_REDUX_ACTIONS: true,
      }));

      const localMockedConfigureStore = require('@reduxjs/toolkit').configureStore;

      require('../store');

      const config = localMockedConfigureStore.mock.calls[0][0];
      const middlewareCallback = config.middleware;

      const getDefaultMiddleware = jest.fn(() => ['default-middleware']);
      const finalMiddlewares = middlewareCallback(getDefaultMiddleware);

      expect(finalMiddlewares).toContain(logger);
      expect(finalMiddlewares).toEqual(['default-middleware', 'mocked-logger']);
    });
  });
});
