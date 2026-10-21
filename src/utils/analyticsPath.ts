import { matchPath } from 'react-router-dom';

const normalizeBaseRoute = (baseRoute?: string) => {
  const normalizedBaseRoute = (baseRoute || '/portale-esercenti').trim();

  if (!normalizedBaseRoute || normalizedBaseRoute === '/') {
    return '';
  }

  return `/${normalizedBaseRoute.replace(/^\/+|\/+$/g, '')}`;
};

const ANALYTICS_BASE_ROUTE = normalizeBaseRoute(process.env.PUBLIC_URL);

const analyticsRoutes = [
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/:pointOfSaleId/modifica-documento/:trxId/:fileDocNumber`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/:pointOfSaleId/storna-transazione/:trxId`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/punti-vendita/:store_id`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/richieste-di-rimborso/:batch_id`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/utenti-segnalati/segnalazione-utenti`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/punti-vendita/censisci`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/panoramica`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/punti-vendita`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/utenti-segnalati`,
  `${ANALYTICS_BASE_ROUTE}/sconti-iniziativa/:initiative_id`,
  `${ANALYTICS_BASE_ROUTE}/crea-sconto/:initiative_id`,
  `${ANALYTICS_BASE_ROUTE}/accetta-sconto/:initiative_id`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/richieste-di-rimborso`,
  `${ANALYTICS_BASE_ROUTE}/:initiative_id/esporta-report`,
  `${ANALYTICS_BASE_ROUTE}/catalogo-punti-vendita`,
  `${ANALYTICS_BASE_ROUTE}/auth`,
  `${ANALYTICS_BASE_ROUTE}/assistenza`,
  `${ANALYTICS_BASE_ROUTE}/terms-of-service`,
  `${ANALYTICS_BASE_ROUTE}/privacy-policy`,
  `${ANALYTICS_BASE_ROUTE}`,
] as const;

export const sanitizeAnalyticsPath = (pathname: string) => {
  const matchedRoute = analyticsRoutes.find((routePath) =>
    Boolean(
      matchPath(pathname, {
        path: routePath,
        exact: true,
        strict: false,
      })
    )
  );

  if (!matchedRoute) {
    return pathname;
  }

  const sanitizedSegments = matchedRoute
    .split('/')
    .filter((segment) => segment && !segment.startsWith(':'));

  return `/${sanitizedSegments.join('/')}`;
};
