import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from '../redux/store';
import { intiativesListSelector, setSelectedInitative } from '../redux/slices/initiativesSlice';
import { useCurrentInitiativeId } from '../hooks/useCurrentInitiativeId';
import ROUTES from '../routes';

type Props = {
  children: React.ReactNode;
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
const WithInitiativeGuard: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const initiatives = useSelector((state: RootState) => intiativesListSelector(state));

  const { initiativeId, isValid, isListLoaded } = useCurrentInitiativeId();

  useEffect(() => {
    if (!initiativeId || !initiatives) {
      return;
    }

    const found = initiatives.find((i) => i.initiativeId === initiativeId);

    if (found) {
      dispatch(
        setSelectedInitative({
          initiativeName: found.initiativeName ?? undefined,
          spendingPeriod:
            found.startDate && found.endDate
              ? `${found.startDate.toLocaleDateString(
                  'fr-FR'
                )} - ${found.endDate.toLocaleDateString('fr-FR')}`
              : '',
        })
      );
    }
  }, [initiativeId, initiatives, dispatch]);

  /**
   * HARDENING – Production Safe Flow
   */

  // 1️⃣ Loading state (mai blank screen)
  if (!isListLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento iniziative...</div>;
  }

  // 2️⃣ Lista vuota
  if (Array.isArray(initiatives) && initiatives.length === 0) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // 3️⃣ initiativeId mancante
  if (!initiativeId) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // 4️⃣ initiativeId invalido
  if (!isValid) {
    return <Redirect to={ROUTES.HOME} />;
  }

  // 5️⃣ Stato valido
  return <>{children}</>;
};

export default WithInitiativeGuard;
