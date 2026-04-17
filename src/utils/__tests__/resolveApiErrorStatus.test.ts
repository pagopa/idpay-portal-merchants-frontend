import { ApiError } from '../../api/ApiError';
import { resolveApiErrorStatus } from '../resolveApiErrorStatus';

describe('resolveApiErrorStatus', () => {
  it('returns status when error is ApiError', () => {
    const err = new ApiError(401, 'boom');
    expect(resolveApiErrorStatus(err)).toBe(401);
  });

  it('returns undefined when error is not ApiError', () => {
    expect(resolveApiErrorStatus(new Error('x'))).toBeUndefined();
  });
});
