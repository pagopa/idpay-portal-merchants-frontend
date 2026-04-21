import { useAppSelector } from '../redux/hooks';
import { currentInitiativeSelector, InitiativeExtended } from '../redux/slices/initiativesSlice';
import { useCurrentInitiativeId } from './useCurrentInitiativeId';

/**
 * FE2.7 – Centralized access to the current initiative (non-breaking)
 *
 * - Route remains the single source of truth
 * - Redux list remains the storage layer
 * - spendingPeriod derived in a single place
 * - No additional writes to Redux
 */
export const useCurrentInitiative = (): InitiativeExtended | undefined => {
  const { initiativeId } = useCurrentInitiativeId();

  return useAppSelector((state) => currentInitiativeSelector(state, initiativeId));
};
