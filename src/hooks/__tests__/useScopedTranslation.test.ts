import { renderHook } from '@testing-library/react-hooks';
import { useScopedTranslation } from '../useScopedTranslation';
import { setupInitiativeMocks } from '../../test-utils/mockInitiativeContext';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));


describe('useScopedTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupInitiativeMocks();
  });

test('should prefix key with baseKey and call t(key, options) when second param is options', () => {
  const options = { ns: 'common' };

const { result } = renderHook(() =>
  useScopedTranslation({ baseKey: 'base' } as any)
);

  result.current.t('hello', options as any);

  expect(mockT).toHaveBeenCalledTimes(1);
  expect(mockT).toHaveBeenCalledWith('hello', options);
});

test('should prefix key with baseKey and call t(key,  options) when second param is string', () => {
  const options = { ns: 'common' };

  const { result } = renderHook(() =>
    useScopedTranslation({ baseKey: 'base' } as any)
  );

  result.current.t('missing', options as any);

  expect(mockT).toHaveBeenCalledTimes(1);
  expect(mockT).toHaveBeenCalledWith('missing', options);
});

test('should pass undefined options through when only key is provided', () => {
  const { result } = renderHook(() =>
    useScopedTranslation({ baseKey: 'base' } as any)
  );

  result.current.t('onlyKey');

  expect(mockT).toHaveBeenCalledTimes(1);
  expect(mockT).toHaveBeenCalledWith('onlyKey', {"ns": "common"});
});
});
