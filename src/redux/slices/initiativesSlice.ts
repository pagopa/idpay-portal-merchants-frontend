import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';
import { InitiativeDTOArray } from '../../api/generated/merchants/InitiativeDTOArray';
import { InitiativeDTO } from '../../api/generated/merchants/InitiativeDTO';

interface InitiativesState {
  list?: InitiativeDTOArray;
  selectedInitative?:
    | {
        initiativeName?: string;
        spendingPeriod?: string;
      }
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
            initiativeName?: string;
            spendingPeriod?: string;
          }
        | undefined
      >
    ) => {
      state.selectedInitative = action.payload
        ? { ...action.payload }
        : undefined;
    },
  },
});

export const { setInitiativesList, setSelectedInitative } = initiativesSlice.actions;
export const initiativesReducer = initiativesSlice.reducer;

export const intiativesListSelector = (state: RootState): InitiativeDTOArray | undefined =>
  state.initiatives.list;

export const initiativeSelector = (
  state: RootState
): { initiativeName?: string; spendingPeriod?: string } | undefined =>
  state.initiatives.selectedInitative;

export type InitiativeExtended = InitiativeDTO & {
  spendingPeriod: string;
};

export const currentInitiativeSelector = createSelector(
  [
    intiativesListSelector,
    (_: RootState, initiativeId: string | undefined) => initiativeId,
  ],
  (
    initiatives,
    initiativeId
  ): InitiativeExtended | undefined => {
    if (!initiatives || !initiativeId) {
      return undefined;
    }

    const initiative = initiatives.find(
      (i) => i.initiativeId === initiativeId
    );

    if (!initiative) {
      return undefined;
    }

    const spendingPeriod =
      initiative.startDate && initiative.endDate
        ? `${new Date(initiative.startDate).toLocaleDateString(
            'fr-FR'
          )} - ${new Date(initiative.endDate).toLocaleDateString('fr-FR')}`
        : '';

    return {
      ...initiative,
      spendingPeriod,
    };
  }
);
