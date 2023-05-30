import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitiativeDTO } from '../../api/generated/merchants/InitiativeDTO';
import { RootState } from '../store';

interface InitiativesState {
  list?: Array<InitiativeDTO>;
}

const initialState: InitiativesState = {};

/* eslint-disable functional/immutable-data */
export const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesList: (state, action: PayloadAction<Array<InitiativeDTO>>) => {
      state.list = action.payload;
    },
  },
});

export const { setInitiativesList } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const intiativesListSelector = (state: RootState): Array<InitiativeDTO> | undefined =>
  state.initiatives.list;
