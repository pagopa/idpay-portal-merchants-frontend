const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken ='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjAzNTkyMjksImV4cCI6MTc2MDM4ODAyOSwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoiZXNlcmNlbnRlVGVzdEB0ZXN0LmVtYWlsLml0IiwiYWNxdWlyZXJfaWQiOiJQQUdPUEEiLCJtZXJjaGFudF9pZCI6ImJiN2I0MTgzLTJhMzgtMzI0My04Y2RkLTIxOGZlYzBjNTI1OCIsIm9yZ19pZCI6IjJiNDhiZjk2LWZkNzQtNDc3ZS1hNzBhLTI4NmI0MTBmMDIwYSIsIm9yZ192YXQiOiIzMzQ0NDQzMzQ4OCIsIm9yZ19uYW1lIjoiRXNlcmNlbnRlIGRpIHRlc3QgSWRQYXkiLCJvcmdfcGFydHlfcm9sZSI6Ik1BTkFHRVIiLCJvcmdfcm9sZSI6ImFkbWluIn0.4eOojm-ZLb51vjnDvIgIxu6n7N4Q6S7qIzgB_6lOEhEDkkAiaUFN0jxiyfDnq4uA6Kl72kEFYd67QYyBQQQVMyx_4l53nkF-gFSiaxrdmGY-0r0eZqASonB2x6TT6j0XWbPSMhDw7BUIWfuD3vmLHO14v0tvbAdKmZoVeEmzb5As8IhzW2N2ZWdM7AHLrTklEE56dgIDlM-hfkvBa4PHFpMlPf4WFfUu6qXG_7AgYPOSqI46P0wlibqLv5maeFwtRCTnlX6BzT45VjOHULC-Bs2lQC8MNGgSQ3DgyKBctgZ2pLUbisuZ3YmKO67u0v5MMka7KCohLWgn2JLnuDiu0g';

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
