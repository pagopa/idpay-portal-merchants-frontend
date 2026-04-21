import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { intiativesListSelector } from '../redux/slices/initiativesSlice';
import { RootState } from '../redux/store';

type RouteParams = {
  initiative_id?: string;
};

/**
 * Deterministically derives the current initiativeId from the route.
 *
 * Architectural constraints:
 * - Route is the single source of truth
 * - No Redux writes
 * - No redirects
 * - No business logic
 * - No side effects
 */
export const useCurrentInitiativeId = (): {
  initiativeId?: string;
  isValid: boolean;
  isListLoaded: boolean;
} => {
  const { initiative_id } = useParams<RouteParams>();

  const initiatives = useSelector((state: RootState) => intiativesListSelector(state));

  const isListLoaded = Array.isArray(initiatives);

  const isValid = useMemo(() => {
    if (!initiative_id || !isListLoaded) {
      return false;
    }

    return initiatives?.some((i) => i.initiativeId === initiative_id) ?? false;
  }, [initiative_id, initiatives, isListLoaded]);

  return {
    initiativeId: initiative_id,
    isValid,
    isListLoaded,
  };
};
