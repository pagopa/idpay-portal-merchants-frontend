import React, { FC, ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render, RenderOptions } from '@testing-library/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { store } from '../../redux/store';
import { createStore } from '../../redux/store';

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export const renderWithContext = (
  element?: React.ReactNode,
  injectedStore?: ReturnType<typeof createStore>,
  injectedHistory?: ReturnType<typeof createMemoryHistory>
) => {
  const history = injectedHistory ? injectedHistory : createMemoryHistory();
  const storeInjected = injectedStore ? injectedStore : createStore();
  render(
    <Provider store={storeInjected}>
      <ThemeProvider theme={theme}>
        <Router history={history}>{element}</Router>
      </ThemeProvider>
    </Provider>
  );
  return { store, history };
};

export const renderWithHistoryAndStore = (
  element?: React.ReactNode,
  injectedStore?: ReturnType<typeof createStore>,
  injectedHistory?: ReturnType<typeof createMemoryHistory>
) => {
  const store = injectedStore ? injectedStore : createStore();
  const history = injectedHistory ? injectedHistory : createMemoryHistory();
  render(
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <Provider store={store}>{element}</Provider>
      </Router>
    </ThemeProvider>
  );
  return { store, history };
};

export * from '@testing-library/react';
// export { customRender as renderWithProviders };
