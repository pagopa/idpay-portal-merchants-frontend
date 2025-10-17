import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@pagopa/selfcare-common-frontend/index.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Provider } from 'react-redux';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { MOCK_USER, testToken } from './utils/constants';
import { ENV } from './utils/env';
import './consentAndAnalyticsConfiguration.ts';
import './locale';
import ROUTES from './routes';
import { persistor, store } from './redux/store';
import { router } from './router';

// eslint-disable-next-line functional/immutable-data
CONFIG.MOCKS.MOCK_USER = MOCK_USER;
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.LOGIN = ENV.URL_FE.LOGIN || '';
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.LOGOUT = ENV.URL_FE.LOGOUT || '';
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.ASSISTANCE = ENV.URL_FE.ASSISTANCE_MERCHANT || '';
// eslint-disable-next-line functional/immutable-data
CONFIG.TEST.JWT = testToken;
// eslint-disable-next-line functional/immutable-data
CONFIG.HEADER.LINK.PRODUCTURL = ROUTES.HOME;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} future={{ v7_startTransition: true }}/>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
