const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Nzg3NzM2MDIsImV4cCI6MTc3ODgwMjQwMiwiYXVkIjoiaWRwYXkucmVnaXN0ZXIud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMTk1ZGE3MGYtZDNmMC00YzU3LWI2MmUtZWY0NzEzNDhlOTIwIiwibmFtZSI6IkxvcmVuem8iLCJmYW1pbHlfbmFtZSI6IkxvbGxvIiwib3JnX2VtYWlsIjoidGVzdC5yZGIuZGV2QGdtYWlsLmNvbSIsIm9yZ19pZCI6IjcyYzJjNWY4LTFjNzEtNDYxNC1hNGIzLTk1ZTNhZWU3MWMzZCIsIm9yZ192YXQiOiJDSEUtMTIzLjQ1Ni43MTIiLCJvcmdfZmMiOiJDSEUtMTIzLjQ1Ni43MTIiLCJvcmdfbmFtZSI6IlByb2R1dHRvcmUgU3ZlblZhdGgiLCJvcmdfcGFydHlfcm9sZSI6Ik9QRVJBVE9SIiwib3JnX3JvbGUiOiJvcGVyYXRvcmUiLCJvcmdfYWRkcmVzcyI6IlZpYSBNdW5pY2lwaW8gTi4gOCwgODEwMzUgUm9jY2Ftb25maW5hIChDRSkiLCJvcmdfcGVjIjoicHJvdG9jb2xsby5yb2NjYW1vbmZpbmFAYXNtZXBlYy5pdCJ9.h-O_Ryt7P0jZl-_Du6KI9VGCPBmOhTN-oRE05tj4S5a20MSFzrf-QbMaVx5xyoG7L2eC9PaJu_5NfWRNt9od2chQ2aTT4V9qCCPSvkfdPZROoWwBpq5r4widu3sL7K7KS9SphPYjioK1tJMRlGizq7yhyI06AWhLqyWMuRLD7HbPiyj62JX59WwhBmqntIzZRff2gjOMYBruSz-SsNrkafEAOxt40yPu_XWpBrm39oKJCA_zh6YiDzOoKCeA6S2z2GOiwB_FqZIEWPgTyrSG_4Wdb2Y1RRJHLZzy_tAtrweE22p_f2oVWLEhEwB3_YUAO9hyOEB7xYg_3wdKK5gmnw';

export const DEBUG_CONSOLE = false;
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
