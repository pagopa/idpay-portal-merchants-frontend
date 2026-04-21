import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { store } from '../redux/store';
import { parseJwt } from '../utils/jwt-utils';

type RequestConfig = {
  path: string;
  method: string;
  secure?: boolean;
  format?: 'json' | 'blob' | 'formData';
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
};

type ApiClientConfig = {
  baseUrl: string;
};

import { browserConsole } from '../utils/consoleLogger';
import { ApiError } from './ApiError';

export class BaseApiClient {
  private baseUrl: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
  }

  private buildQueryString(query?: Record<string, unknown>): string {
    if (!query) {
      return '';
    }

    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  private buildHeaders(
    secure?: boolean,
    customHeaders?: Record<string, string>,
    format?: string
  ): Headers {
    const headers = new Headers();

    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    if (secure) {
      const token = storageTokenOps.read();
      if (token && parseJwt(token)) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (format === 'json') {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  public async safeRequest<T>(config: RequestConfig): Promise<{ data: T }> {
    const { path, method, secure, format, query, body, headers } = config;

    const url = `${this.baseUrl}${path}` + this.buildQueryString(query);

    const requestHeaders = this.buildHeaders(
      secure,
      headers,
      body && format !== 'formData' ? 'json' : undefined
    );

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body:
        body && format === 'formData'
          ? (body as BodyInit)
          : body
          ? JSON.stringify(body)
          : undefined,
    };

    browserConsole.log('[API REQUEST]', {
      method,
      url,
      body,
    });

    const response = await fetch(url, fetchOptions);

    browserConsole.log('[API RESPONSE]', {
      status: response.status,
      url,
    });

    if (response.status === 401) {
      store.dispatch(
        appStateActions.addError({
          id: 'tokenNotValid',
          error: new Error(),
          techDescription: 'Unauthorized - token invalid or expired',
          toNotify: false,
          blocking: false,
          displayableTitle: 'Session expired',
          displayableDescription: 'Please login again',
        })
      );
    }

    if (!response.ok) {
      let errorBody: any;
      try {
        errorBody = await response.json();
      } catch {
        // ignore if no json body
      }

      if (errorBody?.code && errorBody?.message) {
        browserConsole.log('[API BUSINESS ERROR]', {
          status: response.status,
          url,
          errorBody,
        });

        return { data: errorBody as T };
      }

      browserConsole.error('[API TECHNICAL ERROR]', {
        status: response.status,
        url,
        errorBody,
      });

      throw new ApiError(
        response.status,
        errorBody?.message || `API Error - ${response.status}`,
        errorBody?.code,
        errorBody
      );
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const data =
      format === 'blob' ? ((await response.blob()) as T) : ((await response.json()) as T);

    return { data };
  }
}
