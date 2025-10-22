import React, { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react-hooks';
import { useIDPayUser } from '../useIDPayUser';
import { IDPayUser } from '../../model/IDPayUser';

const mockUser: IDPayUser = {
  name: 'Mario',
  surname: 'Rossi',
  fiscalCode: 'RSSMRA80A01H501U',
  email: 'mario.rossi@email.it',
};

const mockUserSlice = createSlice({
  name: 'user',
  initialState: {
    loggedUser: mockUser,
  },
  reducers: {},
});

const mockStore = configureStore({
  reducer: {
    user: mockUserSlice.reducer,
  },
});

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <Provider store={mockStore}>{children}</Provider>
);

describe('useIDPayUser', () => {
  test('should return undefined if the user is not in the store', () => {
    const emptyStore = configureStore({
      reducer: {
        user: createSlice({
          name: 'user',
          initialState: { loggedUser: undefined },
          reducers: {},
        }).reducer,
      },
    });

    const EmptyWrapper: FC<{ children: ReactNode }> = ({ children }) => (
      <Provider store={emptyStore}>{children}</Provider>
    );

    const { result } = renderHook(() => useIDPayUser(), {
      wrapper: EmptyWrapper,
    });

    expect(result.current).toBeUndefined();
  });
});
