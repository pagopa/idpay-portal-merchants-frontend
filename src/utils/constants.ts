import { RewardBatchDTO } from '../api/generated/merchants/data-contracts';

const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const testToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3ODU0MDIyNDUsImV4cCI6MTc4NTQzMTA0NSwiYXVkIjoiaWRwYXkubWVyY2hhbnQud2VsZmFyZS5wYWdvcGEuaXQiLCJpc3MiOiJodHRwczovL2FwaS1pby5kZXYuY3N0YXIucGFnb3BhLml0IiwidWlkIjoiMmY5ZDk3MGQtMzFmYi00MzkzLTg3MjEtMmNhOTIxYmIyYmJjIiwibmFtZSI6ImVzZXJjZW50ZSIsImZhbWlseV9uYW1lIjoidGVzdCIsImVtYWlsIjoiZXNlcmNlbnRlVGVzdEB0ZXN0LmVtYWlsLml0IiwiYWNxdWlyZXJfaWQiOiJQQUdPUEEiLCJtZXJjaGFudF9pZCI6IjNhNjAyYjE3LWFjMWMtMzAyOS05ZTc4LTBhNGJiYjg2OTNkNCIsIm9yZ19pZCI6IjJiNDhiZjk2LWZkNzQtNDc3ZS1hNzBhLTI4NmI0MTBmMDIwYSIsIm9yZ192YXQiOiIzMzQ0NDQzMzQ4OCIsIm9yZ19uYW1lIjoiRXNlcmNlbnRlIGRpIHRlc3QgSWRQYXkiLCJvcmdfcGFydHlfcm9sZSI6Ik1BTkFHRVIiLCJvcmdfcm9sZSI6ImFkbWluIiwic2NvcGUiOiJ0cmFuc2FjdGlvbjppbnZvaWNlbGlmZWN5Y2xlOmZ1bGwifQ.gkLaurOj0O26Y39h7s1WNuX45QZI350-NcSmadsXwAmGPwR09BXdzKArj0kjBldc1xhUbr6GHjdTV76b5-ywHrFYiGMfWKImvVPv3VMtH3Tea8JAj541a3eWAU7tKd7FWSl8rUJUbXGeqHOIhhwroPIleUIuPTcSrrKMdZIGWpeNYyQvIKdAkeMApdRt5PrH-Mvzrh1HHx5SH8QlYgZafJHiXublyTILto6rkqVBbip9iXOCn45oluQ4fcicJxmGx1xVHJI5aRaWyi3dOTHV7BwTHKCDrRDJnXiX0rfpXIdJXaSWFSDUZqtHXLA3vWCKYmtbEkaVTi6AgF6bxpe7kg';

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

export const ASSOCIATION_SUCCESS_ALERT_TIMEOUT = 6000;

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

type RewardBatchStatus = RewardBatchDTO['status'];

export const ENABLED_DOWNLOAD_STATUSES: Array<RewardBatchStatus> = [
  'APPROVED',
  'PENDING_REFUND',
  'REFUNDED',
  'NOT_REFUNDED',
];

export const enum TYPE_TEXT {
  Text = 'text',
  Currency = 'manual',
}

export const MIN_START_DATE = '2025-11-18';
