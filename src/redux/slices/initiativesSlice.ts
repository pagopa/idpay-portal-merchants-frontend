import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

interface InitiativesState {
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

export const initiativesReducer = initiativesSlice.reducer;

export const initiativeSelector = (
  state: RootState
): { initiativeName?: string | undefined; spendingPeriod?: string | undefined } | undefined =>
  state.initiatives.selectedInitative;
