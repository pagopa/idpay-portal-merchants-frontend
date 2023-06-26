import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { InitiativeDTOArray } from '../../api/generated/merchants/InitiativeDTOArray';

interface InitiativesState {
  list?: InitiativeDTOArray;
  selectedInitative?:
    | { initiativeName?: string | undefined; spendingPeriod?: string | undefined }
    | undefined;
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
    setSelectedInitative: (
      state,
      action: PayloadAction<
        | {
            initiativeName?: string | undefined;
            spendingPeriod?: string | undefined;
          }
        | undefined
      >
    ) => {
      state.selectedInitative = { ...action.payload };
    },
  },
});

export const { setInitiativesList, setSelectedInitative } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const intiativesListSelector = (state: RootState): InitiativeDTOArray | undefined =>
  state.initiatives.list;

export const initiativeSelector = (
  state: RootState
): { initiativeName?: string | undefined; spendingPeriod?: string | undefined } | undefined =>
  state.initiatives.selectedInitative;
