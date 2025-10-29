const ROUTES = {
  UPCOMING: `iniziativa-in-arrivo`,
  HOME: ``,
  ASSISTANCE: `assistenza`,
  OVERVIEW: `:id/panoramica`,
  SIDE_MENU_OVERVIEW: `panoramica`,
  STORES: `:id/punti-vendita`,
  STORES_DETAIL: `:id/punti-vendita/:store_id`,
  STORES_UPLOAD: `:id/punti-vendita/censisci`,
  SIDE_MENU_STORES: `punti-vendita`,
  TOS: `terms-of-service`,
  PRIVACY_POLICY: `privacy-policy`,
  DISCOUNTS: `sconti-iniziativa/:id`,
  SIDE_MENU_DISCOUNTS: `sconti-iniziativa`,
  NEW_DISCOUNT: `crea-sconto/:id`,
  ACCEPT_NEW_DISCOUNT: `accetta-sconto/:id`,
};
export default ROUTES;
