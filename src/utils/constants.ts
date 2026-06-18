const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken = '';

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

export const EMAIL_REGEX = new RegExp("^(?=.{1,255}$)[A-Za-z0-9]([A-Za-z0-9+_-]*(\\.[A-Za-z0-9+_-]+)*)?@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}$");
export const IBAN_REGEX = new RegExp("^IT\\d{2}[A-Z]\\d{5}\\d{5}[A-Z0-9]{12}$");
export const IBAN_HOLDER_REGEX = new RegExp("^[\\p{L}'\\s-]+$", "u");
