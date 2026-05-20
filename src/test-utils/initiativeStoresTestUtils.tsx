import React, { ReactElement } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

/**
 * Creates a minimal redux mock store with optional initial state.
 */
export const createMockStore = (initialState?: any) =>
  configureStore({
    reducer: () => initialState ?? {},
  });

/**
 * Render helper with redux provider.
 */
export const renderWithRedux = (
  ui: ReactElement,
  { initialState }: { initialState?: any } = {}
) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{ui}</Provider>);
};

/**
 * Opens edit modal and waits for modal description text.
 */
export const openEditModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /Modifica/i }));
  await waitFor(() =>
    expect(
      screen.getByText('pages.initiativeStores.modalDescription')
    ).toBeInTheDocument()
  );
};

/**
 * Fills and confirms two email textboxes (by index).
 */
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

/**
 * Generic confirm button click helper.
 */
export const clickConfirmButton = async (user: ReturnType<typeof userEvent.setup>, testId: string) => {
  const button = screen.getByTestId(testId);
  await user.click(button);
};

/**
 * Utility to blur a field.
 */
export const blurElement = (element: HTMLElement) => {
  fireEvent.blur(element);
};
