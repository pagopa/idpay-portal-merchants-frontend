import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { store } from '../redux/store';
import { cleanupOnLogout } from '../utils/logoutCleanup';
import { ENV } from '../utils/env';
import { ApiError } from './ApiError';

export const axiosInstance = axios.create();

const tryParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const decodeBytesToText = (bytes: Uint8Array): string => {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }

  return String.fromCharCode(...Array.from(bytes));
};

const decodeErrorBody = (rawData: unknown): unknown => {
  if (rawData == null) {
    return rawData;
  }

  if (typeof rawData === 'string') {
    return tryParseJson(rawData);
  }

  if (rawData instanceof ArrayBuffer) {
    const text = decodeBytesToText(new Uint8Array(rawData)).split('\0').join('').trim();
    return tryParseJson(text);
  }

  if (ArrayBuffer.isView(rawData)) {
    const view = rawData as ArrayBufferView;
    const text = decodeBytesToText(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
    )
      .split('\0')
      .join('')
      .trim();
    return tryParseJson(text);
  }

  return rawData;
};

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storageTokenOps.read();

  if (!token) {
    return config;
  }

  const newConfig: InternalAxiosRequestConfig = {
    ...config,
    headers: {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
    },
  } as InternalAxiosRequestConfig;

  return newConfig;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<unknown>) => {
    const status = error.response?.status;

    if (status === 401) {
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

      cleanupOnLogout();
      window.location.assign(ENV.URL_FE.LOGOUT);
    }

    const errorBody: any = decodeErrorBody(error.response?.data);

    if (errorBody?.code && errorBody?.message) {
      return Promise.reject(
        new ApiError(status || 500, errorBody.message, errorBody.code, errorBody)
      );
    }

    return Promise.reject(
      new ApiError(
        status || 500,
        errorBody?.message || error.message || 'API Error',
        errorBody?.code,
        errorBody
      )
    );
  }
);
