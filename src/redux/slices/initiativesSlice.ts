import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { InitiativeDTOArray } from '../../api/generated/merchants/InitiativeDTOArray';

interface InitiativesState {
  list?: InitiativeDTOArray;
  selectedName?: string | undefined;
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
    setSelectedName: (state, action: PayloadAction<string | undefined>) => {
      state.selectedName = action.payload;
    },
  },
});

export const { setInitiativesList, setSelectedName } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const intiativesListSelector = (state: RootState): InitiativeDTOArray | undefined =>
  state.initiatives.list;
export const initiativeNameSelector = (state: RootState): string | undefined =>
  state.initiatives.selectedName;
