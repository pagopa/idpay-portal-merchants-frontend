import React, { useEffect, useLayoutEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from '../redux/store';
import { intiativesListSelector } from '../redux/slices/initiativesSlice';
import { useCurrentInitiativeId } from '../hooks/useCurrentInitiativeId';
import ROUTES from '../routes';
import { useInitiativeConfig } from '../hooks/useInitiativeConfig';
import { useCurrentInitiative } from '../hooks/useCurrentInitiative';
import {
  clearInitiativeAnalyticsProperties,
  syncInitiativeAnalyticsProperties,
  trackAnalyticsPageView,
} from '../services/analyticsService';

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
  const [isValidRoute, setIsValidRoute] = useState<boolean>(true);
  const initiatives = useSelector((state: RootState) => intiativesListSelector(state));
  const { initiativeId, isValid, isListLoaded } = useCurrentInitiativeId();
  const selectedInitiative = useCurrentInitiative();
  const { getConfig } = useInitiativeConfig<Array<string>>();

  useEffect(() => {
    if (selectedInitiative) {
      void getConfig('routes', selectedInitiative).then((res) =>
        setIsValidRoute(res?.includes(route))
      );
    }
  }, [selectedInitiative]);

  if (!isListLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento iniziative...</div>;
  }

  if (Array.isArray(initiatives) && initiatives.length === 0) {
    return <Redirect to={ROUTES.HOME} />;
  }

  if (!initiativeId) {
    return <Redirect to={ROUTES.HOME} />;
  }

  if (!isValid) {
    return <Redirect to={ROUTES.HOME} />;
  }

  if (!isValidRoute) {
    return <Redirect to={ROUTES.HOME} />;
  }

  return <React.Fragment key={initiativeId}>{children}</React.Fragment>;
};

const initiativeRoutes = [
  ROUTES.OVERVIEW,
  ROUTES.STORES,
  ROUTES.REPORTED_USERS,
  ROUTES.REPORTED_USERS_INSERT,
  ROUTES.STORES_DETAIL,
  ROUTES.STORES_UPLOAD,
  ROUTES.DISCOUNTS,
  ROUTES.NEW_DISCOUNT,
  ROUTES.ACCEPT_NEW_DISCOUNT,
  ROUTES.REFUND_REQUESTS,
  ROUTES.REFUND_REQUESTS_STORE,
  ROUTES.MODIFY_DOCUMENT,
  ROUTES.REVERSE,
  ROUTES.EXPORT_REPORT,
];

export const InitiativeAnalyticsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const initiatives = useSelector((state: RootState) => intiativesListSelector(state));
  const [lastPageViewContext, setLastPageViewContext] = useState<string>();

  useLayoutEffect(() => {
    const routeMatch = matchPath<{ initiative_id: string }>(location.pathname, {
      path: initiativeRoutes,
      exact: false,
      strict: false,
    });
    const initiativeId = routeMatch?.params.initiative_id;
    const initiative = initiativeId
      ? initiatives?.find((item) => item.initiativeId === initiativeId)
      : undefined;

    if (initiativeId) {
      syncInitiativeAnalyticsProperties(initiative?.initiativeName, initiativeId);

      if (!initiative) {
        return;
      }
    } else {
      clearInitiativeAnalyticsProperties();
    }

    const pageViewContext = `${location.pathname}|${initiativeId ?? 'global'}|${
      initiative?.initiativeName ?? ''
    }`;

    if (lastPageViewContext !== pageViewContext) {
      setLastPageViewContext(pageViewContext);
      trackAnalyticsPageView(location.pathname);
    }
  }, [location.pathname, initiatives, lastPageViewContext]);

  useEffect(() => () => {
    clearInitiativeAnalyticsProperties();
  }, []);

  return <>{children}</>;
};

export default WithInitiativeGuard;
