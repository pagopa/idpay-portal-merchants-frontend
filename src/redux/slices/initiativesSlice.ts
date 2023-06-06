import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { InitiativeDTOArray } from '../../api/generated/merchants/InitiativeDTOArray';

interface InitiativesState {
  list?: InitiativeDTOArray;
}

const initialState: InitiativesState = {};

/* eslint-disable functional/immutable-data */
export const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesList: (state, action: PayloadAction<InitiativeDTOArray>) => {
      state.list = [...action.payload];
    },
  },
});

export const { setInitiativesList } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const intiativesListSelector = (state: RootState): InitiativeDTOArray | undefined =>
  state.initiatives.list;
