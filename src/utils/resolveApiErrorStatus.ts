import { ApiError } from '../api/ApiError';

export const resolveApiErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof ApiError) {
    return error.status;
  }

  return undefined;
};
