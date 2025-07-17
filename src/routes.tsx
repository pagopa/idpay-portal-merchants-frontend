import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,
  ASSISTANCE: `${BASE_ROUTE}/assistenza`,
  OVERVIEW: `${BASE_ROUTE}/panoramica/:id`,
  SIDE_MENU_OVERVIEW: `${BASE_ROUTE}/panoramica`,
  STORES: `${BASE_ROUTE}/punti-vendita/:id`,
  SIDE_MENU_STORES: `${BASE_ROUTE}/punti-vendita`,
  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
  DISCOUNTS: `${BASE_ROUTE}/sconti-iniziativa/:id`,
  SIDE_MENU_DISCOUNTS: `${BASE_ROUTE}/sconti-iniziativa`,
  NEW_DISCOUNT: `${BASE_ROUTE}/crea-sconto/:id`,
  ACCEPT_NEW_DISCOUNT: `${BASE_ROUTE}/accetta-sconto/:id`,
};

export default ROUTES;
