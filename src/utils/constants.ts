const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM0NTczNDksImV4cCI6MTc2MzQ4NjE0OSwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoiZXNlcmNlbnRlVGVzdEB0ZXN0LmVtYWlsLml0IiwiYWNxdWlyZXJfaWQiOiJQQUdPUEEiLCJtZXJjaGFudF9pZCI6IjNhNjAyYjE3LWFjMWMtMzAyOS05ZTc4LTBhNGJiYjg2OTNkNCIsIm9yZ19pZCI6IjJiNDhiZjk2LWZkNzQtNDc3ZS1hNzBhLTI4NmI0MTBmMDIwYSIsIm9yZ192YXQiOiIzMzQ0NDQzMzQ4OCIsIm9yZ19uYW1lIjoiRXNlcmNlbnRlIGRpIHRlc3QgSWRQYXkiLCJvcmdfcGFydHlfcm9sZSI6Ik1BTkFHRVIiLCJvcmdfcm9sZSI6ImFkbWluIn0.x7JJSGCrmh_ymK_2scqzs6tEEUtLmulE6BZNysZ83Z56Z_3Pl1NeRN-kTY0OS-KwFWfkRtUc_8PPx0ohZ8fqx2B40oDd_39fsPXP8Ks_ad7nHR_wXD0Mt8-4iHmYQrT0Fi3b-cYKHRRpO_XsEUieGk-Z1C4mo9tCdRJ_xnApQFVvXpgp2mSOM-iVal4q6tLXM964392_YyaZY2lpVWo5OtGXgAMK0cUsdg6Dx1J4oqJxA9dSYXkvW23tsjVOQDe59ylWbUfuU-jZ81amw77ujNuvdjFCsMSPrVP3rjdI6BfOHgTZMtzLvgMsm1qXD2J25upLvk6WvDauz8qTMoINMQ';

export const MOCK_USER = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;

export const LOADING_TASK_LOGIN_CHECK = 'LOGIN_CHECK';
export const LOADING_TASK_SEARCH_PARTIES = 'SEARCH_PARTIES';
export const LOADING_TASK_SEARCH_PARTY = 'SEARCH_PARTY';
export const LOADING_TASK_SEARCH_PRODUCTS = 'SEARCH_PRODUCTS';

export const MISSING_DATA_PLACEHOLDER = '-';
export const MISSING_EURO_PLACEHOLDER = '0,00 €';

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
