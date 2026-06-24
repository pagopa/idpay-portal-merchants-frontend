import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,
  ASSISTANCE: `${BASE_ROUTE}/assistenza`,
  OVERVIEW: `${BASE_ROUTE}/:initiative_id/panoramica`,
  SIDE_MENU_OVERVIEW: `panoramica`,
  STORES: `${BASE_ROUTE}/:initiative_id/punti-vendita`,
  REPORTED_USERS: `${BASE_ROUTE}/:initiative_id/utenti-segnalati`,
  SIDE_MENU_REPORTED_USERS: `utenti-segnalati`,
  REPORTED_USERS_INSERT: `${BASE_ROUTE}/:initiative_id/utenti-segnalati/segnalazione-utenti`,
  STORES_DETAIL: `${BASE_ROUTE}/:initiative_id/punti-vendita/:store_id`,
  STORES_UPLOAD: `${BASE_ROUTE}/:initiative_id/punti-vendita/censisci`,
  SIDE_MENU_STORES: `punti-vendita`,
  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
  DISCOUNTS: `${BASE_ROUTE}/sconti-iniziativa/:initiative_id`,
  SIDE_MENU_DISCOUNTS: `${BASE_ROUTE}/sconti-iniziativa`,
  NEW_DISCOUNT: `${BASE_ROUTE}/crea-sconto/:initiative_id`,
  ACCEPT_NEW_DISCOUNT: `${BASE_ROUTE}/accetta-sconto/:initiative_id`,
  REFUND_REQUESTS: `${BASE_ROUTE}/:initiative_id/richieste-di-rimborso`,
  REFUND_REQUESTS_STORE: `${BASE_ROUTE}/:initiative_id/richieste-di-rimborso/:batch_id`,
  SIDE_MENU_REFUND_REQUESTS: `richieste-di-rimborso`,
  MODIFY_DOCUMENT: `${BASE_ROUTE}/:initiative_id/:pointOfSaleId/modifica-documento/:trxId/:fileDocNumber`,

  REVERSE: `${BASE_ROUTE}/:initiative_id/:pointOfSaleId/storna-transazione/:trxId`,
  EXPORT_REPORT: `${BASE_ROUTE}/:initiative_id/esporta-report`,
  SIDE_MENU_EXPORT_REPORT: `esporta-report`,
  POS_CATALOG: `${BASE_ROUTE}/catalogo-punti-vendita`
};

export default ROUTES;
