import { axiosInstance } from './axiosInstance';

/**
 * Adapter that makes axios behave like fetch
 * so it can be injected into swagger-typescript-api HttpClient
 */

/**
 * Adapter that makes axios behave like fetch
 * so it can be injected into swagger-typescript-api HttpClient
 */
export const axiosFetchAdapter: typeof fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();

  const axiosResponse = await axiosInstance.request({
    url,
    method: init?.method as any,
    headers: init?.headers as any,
    data: init?.body,
    responseType: 'arraybuffer',
  });

  const blob = new Blob([axiosResponse.data]);

  return new Response(blob, {
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
    headers: axiosResponse.headers as any,
  });
};
