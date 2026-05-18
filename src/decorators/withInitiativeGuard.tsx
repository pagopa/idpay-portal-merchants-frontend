import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from '../redux/store';
import { intiativesListSelector } from '../redux/slices/initiativesSlice';
import { useCurrentInitiativeId } from '../hooks/useCurrentInitiativeId';
import ROUTES from '../routes';
import { useCurrentInitiative } from '../hooks/useCurrentInitiative';
import { useInitiativeRoutes } from '../hooks/useInitiativeRoutes';

type Props = {
  children: React.ReactNode;
  route: string;
};

/**
 * Guard that enforces route → Redux synchronization.
 *
 * Responsibilities:
 * - Validate initiativeId from route
 * - Ensure initiatives list is loaded
 * - Redirect if invalid
 * - Synchronize selectedInitiative in Redux (derived state)
 *
 * Architectural constraints:
 * - Route remains the single source of truth
 * - No navigation triggered by Redux
 */
const WithInitiativeGuard: React.FC<Props> = ({ children, route }) => {
  const initiatives = useSelector((state: RootState) => intiativesListSelector(state));
  const { initiativeId, isValid, isListLoaded } = useCurrentInitiativeId();
  const selectedInitiative = useCurrentInitiative();
  const {getInitiativeRoutes} = useInitiativeRoutes();

  const validRoutes = getInitiativeRoutes(selectedInitiative?.initiativeName, selectedInitiative?.startDate) as unknown as Array<string>;

  const isValidRoute = validRoutes.includes(route);
  /**
   * HARDENING – Production Safe Flow
   */

  // 1️⃣ Loading state (mai blank screen)
  if (!isListLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento iniziative...</div>;
  }

  // 2️⃣ Empty list
  if (Array.isArray(initiatives) && initiatives.length === 0) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // 3️⃣ initiativeId missing
  if (!initiativeId) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // 4️⃣ initiativeId invalid
  if (!isValid) {
    return <Redirect to={ROUTES.HOME} />;
  }

  if (!isValidRoute) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // 5️⃣ State OK
  return <>{children}</>;
};

export default WithInitiativeGuard;
