import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { store } from '../redux/store';
import { cleanupOnLogout } from '../utils/logoutCleanup';
import { ENV } from '../utils/env';
import { ApiError } from './ApiError';

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
  }
);

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

    const errorBody: any = error.response?.data;

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
