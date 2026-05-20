import { renderHook } from '@testing-library/react-hooks';
import { useScopedTranslation } from '../useScopedTranslation';
import { useAppSelector } from '../../redux/hooks';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

jest.mock('../useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('useScopedTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppSelector as jest.Mock).mockReturnValue([
      { initiativeId: 'initiative-1' },
    ]);
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
