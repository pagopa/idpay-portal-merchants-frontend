const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3ODA1NTcxMDgsImV4cCI6MTc4MDU4NTkwOCwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoic2RzYWRzYWRzQGdtYWlsLmNvbSIsImFjcXVpcmVyX2lkIjoiUEFHT1BBIiwibWVyY2hhbnRfaWQiOiIyODBiMDlkYy03NmQ5LTNiOTMtYmYyMS02OGE1MDk0YmMzMjIiLCJvcmdfaWQiOiIyOWRlYzQyMS0yNWVjLTRlZTYtYmY1Ny0yMjVjMWI3ZWJlMWMiLCJvcmdfdmF0IjoiMDA4NzYzMjA0MDkiLCJvcmdfbmFtZSI6IlVOSUVVUk8gIFMuUC5BLiIsIm9yZ19wYXJ0eV9yb2xlIjoiREVMRUdBVEUiLCJvcmdfcm9sZSI6ImFkbWluIiwic2NvcGUiOiJ0cmFuc2FjdGlvbjppbnZvaWNlbGlmZWN5Y2xlOmZ1bGwifQ.vcPESvBEiAdVexFIFzDddb_c4RA5zUdYS0uBbZdYOUFdy_DqK3sKx2YlKiFfAaCfOvrHF2IzyMJ5HmQId2Vd22b4Urcgww3nVKkddV4WfeCLXA3tVJW_PesfQpbs8Sj70i4xVhLTDdGh9mjmLBmmf-ugJx4tuwOGkVbfhUTM5B607Y10QDQvBiKvzi0tO8E_VVrvEj2V5igAIW8PPAF-Y2x0HICUobW6OIgPFJ844CD1ZWWdeB10mRohczeKQ62Xd40KJOMCId-WNKE1_RSSDy7I_2Rs-3iZuTXH2_DkA4Ul3RXnd2snWwMJ26JEjgLKSnPByT9BJAUsVVTHjdXaMw';

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
