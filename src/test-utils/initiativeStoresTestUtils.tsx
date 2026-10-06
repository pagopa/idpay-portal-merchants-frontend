import { ReactElement } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

export const createMockStore = (initialState?: any) =>
  configureStore({
    reducer: () => initialState ?? {},
  });

export const renderWithRedux = (
  ui: ReactElement,
  { initialState }: { initialState?: any } = {}
) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{ui}</Provider>);
};

export const openEditModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /Modifica/i }));
  await waitFor(() =>
    expect(screen.getByText('pages.initiativeStores.modalDescription')).toBeInTheDocument()
  );
};

export const fillAndConfirmEmailsByIndex = async (
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  firstIndex = 2,
  secondIndex = 3
) => {
  const inputs = screen.getAllByRole('textbox');
  const email1 = inputs[firstIndex];
  const email2 = inputs[secondIndex];

  await user.clear(email1);
  await user.type(email1, email);
  await user.clear(email2);
  await user.type(email2, email);
};

export const clickConfirmButton = async (
  user: ReturnType<typeof userEvent.setup>,
  testId: string
) => {
  const button = screen.getByTestId(testId);
  await user.click(button);
};

export const blurElement = (element: HTMLElement) => {
  fireEvent.blur(element);
};
