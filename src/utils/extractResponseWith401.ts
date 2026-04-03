import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { isRight } from 'fp-ts/lib/Either';
import { ENV } from './env';

/**
 * Wrapper around extractResponse to centralize 401 handling.
 * If response status is 401, force logout redirect.
 */
export const extractResponseWith401 = async <T>(
  result: any,
  successHttpStatus: number | Array<number>,
  onRedirectToLogin: () => void
): Promise<T> => {
  const httpStatus = (result as any)?.right?.status;
  if (isRight(result) && httpStatus === 401) {
    window.location.assign(ENV.URL_FE.LOGOUT);
    return new Promise<T>(() => null);
  }

  return extractResponse(result, successHttpStatus, onRedirectToLogin) as Promise<T>;
};
