const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NzE0MDMxMTEsImV4cCI6MTc3MTQzMTkxMSwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoiZXNlcmNlbnRlVGVzdEB0ZXN0LmVtYWlsLml0IiwiYWNxdWlyZXJfaWQiOiJQQUdPUEEiLCJtZXJjaGFudF9pZCI6IjNhNjAyYjE3LWFjMWMtMzAyOS05ZTc4LTBhNGJiYjg2OTNkNCIsIm9yZ19pZCI6IjJiNDhiZjk2LWZkNzQtNDc3ZS1hNzBhLTI4NmI0MTBmMDIwYSIsIm9yZ192YXQiOiIzMzQ0NDQzMzQ4OCIsIm9yZ19uYW1lIjoiRXNlcmNlbnRlIGRpIHRlc3QgSWRQYXkiLCJvcmdfcGFydHlfcm9sZSI6Ik1BTkFHRVIiLCJvcmdfcm9sZSI6ImFkbWluIn0.wHQdqnuEGbUn_6b0dfNCk3axL1oVFCkpf0XjNiwZ4BFymjCOu0A00cdCc_QPIc6nAdFFeKEa1z0YLPVcH1K70XyRT-yQRc2uiWK4txdWcJOMycvBhEzJnMdU1tF6GIMQ9DJ5UFiHeI6-Z3QKlUacgjcZ2C1e_X14F7FMTbUx5mIpm15I6aBdq0R8a5wBdTCKYjd6z61HYSBvfUW5LDLwtZHdqic8_quORc6hG44ZYzs6m5knsOREf8p_D3WthztqhH5ZqJLn5KKC1htQdxd6Uj5-JETd3YfRIX_Wf8KV0BriKX_Sit8GePGB8AxNpN8CzfIxk6eBojX1iEsAwFgECw';

export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;

export const LOADING_TASK_LOGIN_CHECK = 'LOGIN_CHECK';
export const LOADING_TASK_SEARCH_PARTIES = 'SEARCH_PARTIES';
export const LOADING_TASK_SEARCH_PARTY = 'SEARCH_PARTY';
export const LOADING_TASK_SEARCH_PRODUCTS = 'SEARCH_PRODUCTS';

export const MISSING_DATA_PLACEHOLDER = '-';
export const MISSING_EURO_PLACEHOLDER = '0,00 €';

export const ELEMENT_PER_PAGE = [10, 25, 50, 100];

export const enum POS_UPDATE {
  Csv = 'csv',
  Manual = 'manual',
}
export const enum POS_TYPE {
  Online = 'ONLINE',
  Physical = 'PHYSICAL',
}

export const PAGINATION_SIZE = 10;

export const MANDATORY_FIELD = 'Il campo è obbligatorio';

export const enum TYPE_TEXT {
  Text = 'text',
  Currency = 'manual',
}

export const MIN_START_DATE = '2025-11-18';
