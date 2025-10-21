const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjEwMjc1ODgsImV4cCI6MTc2MTA1NjM4OCwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoiZXNlcmNlbnRlVGVzdEB0ZXN0LmVtYWlsLml0IiwiYWNxdWlyZXJfaWQiOiJQQUdPUEEiLCJtZXJjaGFudF9pZCI6ImJiN2I0MTgzLTJhMzgtMzI0My04Y2RkLTIxOGZlYzBjNTI1OCIsIm9yZ19pZCI6IjJiNDhiZjk2LWZkNzQtNDc3ZS1hNzBhLTI4NmI0MTBmMDIwYSIsIm9yZ192YXQiOiIzMzQ0NDQzMzQ4OCIsIm9yZ19uYW1lIjoiRXNlcmNlbnRlIGRpIHRlc3QgSWRQYXkiLCJvcmdfcGFydHlfcm9sZSI6Ik1BTkFHRVIiLCJvcmdfcm9sZSI6ImFkbWluIn0.QlE4IJK2DpBzT1h_PTST805mFPRUODA2LjsnIV9GAxm-MJA7AcbttaScgPTYjgpw2qJbZIqlDQE5a_9pI-athELtnXCDWxMAEh2RM0V6Y1MyiH4aQBzRlfX66pgOjbw8VOZ7ExlRuigGlDnwPWuqYuneLavxxrPP8I5dwAudAoQ52f7cOTyM8WszkgJhCM5AVLuIrgvhJJuc4t4x6_V5QoEu0YE3Go5QroPWmREGSo1dOCsVagyJtBJ7lpiS-unwD2Vr4x8GWAyPXMVLsAvyo1VL6jVFLmpIX0YGfMLVktbsfxs7MQzCOd7aQxumuz35h_kDCzW6nUvsAedwOBKR1Q';

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
