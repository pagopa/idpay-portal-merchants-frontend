const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NzQ0MzU5MDAsImV4cCI6MTc3NDQ2NDcwMCwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoiZXNlcmNlbnRlVGVzdEB0ZXN0LmVtYWlsLml0IiwiYWNxdWlyZXJfaWQiOiJQQUdPUEEiLCJtZXJjaGFudF9pZCI6IjNhNjAyYjE3LWFjMWMtMzAyOS05ZTc4LTBhNGJiYjg2OTNkNCIsIm9yZ19pZCI6IjJiNDhiZjk2LWZkNzQtNDc3ZS1hNzBhLTI4NmI0MTBmMDIwYSIsIm9yZ192YXQiOiIzMzQ0NDQzMzQ4OCIsIm9yZ19uYW1lIjoiRXNlcmNlbnRlIGRpIHRlc3QgSWRQYXkiLCJvcmdfcGFydHlfcm9sZSI6Ik1BTkFHRVIiLCJvcmdfcm9sZSI6ImFkbWluIiwic2NvcGUiOiJ0cmFuc2FjdGlvbjppbnZvaWNlbGlmZWN5Y2xlOmZ1bGwifQ.P-J_tH6oN7_JNitZ-790GkjjHHPOgViFb6adEm0A70UT5W4TkOeVkfUDTJvF0RId4qn5araPt0at-DbsIiGmHoXLO6zcsWpDx9rgJ-UIM8s6g1U49fQFwMFblbnN6im9IxA2GnUypITidnoK3vVL8bqi-pGMOhe706DY8jdzQJppXE0IIVarC0xQMag4uFqI5BXcbQciaXd9jRtSXetAq88aVt2djRt-WT9omjeaMeHmaN-l3GQQo1BO-Ony_Mz1TA-YVn64PfJFApgswHGfTeQqX5wt823C2Q8gebbhstnfRdbci3y4rP1mKdIiciuip_5LW4MNNtpd2Jz9B_31qg';

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
