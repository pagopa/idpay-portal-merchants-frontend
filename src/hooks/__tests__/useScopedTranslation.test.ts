import { renderHook } from '@testing-library/react-hooks';
import { useTranslation } from 'react-i18next';
import { useScopedTranslation } from '../useScopedTranslation';

jest.mock('react-i18next');

const mockedUseTranslation = useTranslation as jest.Mock;

describe('useScopedTranslation', () => {
  const tMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTranslation.mockReturnValue({ t: tMock } as any);
  });

  test('should prefix key with baseKey and call t(key, options) when second param is options', () => {
    const options = { ns: 'common' };

    const { result } = renderHook(() => useScopedTranslation('base'));
    const scopedT = result.current;

    scopedT('hello', options as any);

    expect(tMock).toHaveBeenCalledTimes(1);
    expect(tMock).toHaveBeenCalledWith('base.hello', options);
  });

  test('should prefix key with baseKey and call t(key, defaultValue, options) when second param is string', () => {
    const defaultValue = 'Default value';
    const options = { ns: 'common' };

    const { result } = renderHook(() => useScopedTranslation('base'));
    const scopedT = result.current;

    scopedT('missing', defaultValue, options as any);

    expect(tMock).toHaveBeenCalledTimes(1);
    expect(tMock).toHaveBeenCalledWith('base.missing', defaultValue, options);
  });

  test('should pass undefined options through when only key is provided', () => {
    const { result } = renderHook(() => useScopedTranslation('base'));
    const scopedT = result.current;

    scopedT('onlyKey');

    expect(tMock).toHaveBeenCalledTimes(1);
    expect(tMock).toHaveBeenCalledWith('base.onlyKey', undefined);
  });
});
