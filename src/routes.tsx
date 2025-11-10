import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,
  ASSISTANCE: `${BASE_ROUTE}/assistenza`,
  OVERVIEW: `${BASE_ROUTE}/:id/panoramica`,
  SIDE_MENU_OVERVIEW: `panoramica`,
  STORES: `${BASE_ROUTE}/:id/punti-vendita/`,
  REPORTED_USERS: `${BASE_ROUTE}/:id/utenti-segnalati`,
  SIDE_MENU_REPORTED_USERS: `utenti-segnalati`,
  REPORTED_USERS_INSERT: `${BASE_ROUTE}/:id/utenti-segnalati/segnalazione-utenti`,
  STORES_DETAIL: `${BASE_ROUTE}/:id/punti-vendita/:store_id`,
  STORES_UPLOAD: `${BASE_ROUTE}/:id/punti-vendita/censisci`,
  SIDE_MENU_STORES: `punti-vendita`,
  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
  DISCOUNTS: `${BASE_ROUTE}/sconti-iniziativa/:id`,
  SIDE_MENU_DISCOUNTS: `${BASE_ROUTE}/sconti-iniziativa`,
  NEW_DISCOUNT: `${BASE_ROUTE}/crea-sconto/:id`,
  ACCEPT_NEW_DISCOUNT: `${BASE_ROUTE}/accetta-sconto/:id`,
};

export default ROUTES;
