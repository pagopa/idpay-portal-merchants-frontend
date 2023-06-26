import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { InitiativeDTOArray } from '../../api/generated/merchants/InitiativeDTOArray';

interface InitiativesState {
  list?: InitiativeDTOArray;
  selectedName?: string | undefined;
  selectedInitative?: object | undefined;
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
    setSelectedInitative: (state, action: PayloadAction<object | undefined>) => {
      state.selectedInitative = {...action.payload};
    },
  },
});

export const { setInitiativesList, setSelectedName, setSelectedInitative } =
  initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const intiativesListSelector = (state: RootState): InitiativeDTOArray | undefined =>
  state.initiatives.list;
export const initiativeNameSelector = (state: RootState): string | undefined =>
  state.initiatives.selectedName;

export const initiativeSelector = (state: RootState): object | undefined =>
  state.initiatives.selectedInitative;
