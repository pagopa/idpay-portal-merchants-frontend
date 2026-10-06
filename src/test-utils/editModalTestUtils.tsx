import { ReactElement } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

export const createMockStore = (initialState?: any) =>
  configureStore({
    reducer: () => initialState ?? {},
  });

export const renderWithMockStore = (
  ui: ReactElement,
  { initialState }: { initialState?: any } = {}
) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{ui}</Provider>);
};

