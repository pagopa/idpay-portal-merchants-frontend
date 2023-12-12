import { ENV } from './utils/env';

export const BASE_ROUTE = ENV.PUBLIC_URL;

const ROUTES = {
  AUTH: `${BASE_ROUTE}/auth`,
  HOME: `${BASE_ROUTE}`,
  ASSISTANCE: `${BASE_ROUTE}/assistenza`,
  TOS: `${BASE_ROUTE}/terms-of-service`,
  PRIVACY_POLICY: `${BASE_ROUTE}/privacy-policy`,
  DISCOUNTS: `${BASE_ROUTE}/sconti-iniziativa/:id`,
  NEW_DISCOUNT: `${BASE_ROUTE}/crea-sconto/:id`,
  ACCEPT_NEW_DISCOUNT: `${BASE_ROUTE}/accetta-sconto/:id`,
};

export default ROUTES;
