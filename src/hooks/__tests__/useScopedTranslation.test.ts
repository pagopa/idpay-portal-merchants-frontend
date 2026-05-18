import { renderHook } from '@testing-library/react-hooks';
import { useTranslation } from 'react-i18next';
import { useScopedTranslation } from '../useScopedTranslation';
import { setInitiativesList, initiativesReducer, intiativesListSelector } from '../../redux/slices/initiativesSlice';
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
  (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])

  beforeEach(() => {
    jest.clearAllMocks();
});

test('should prefix key with baseKey and call t(key, options) when second param is options', () => {
  const options = { ns: 'common' };

const { result } = renderHook(() => useScopedTranslation('base'));

  result.current.t('hello', options as any);

  expect(mockT).toHaveBeenCalledTimes(1);
  expect(mockT).toHaveBeenCalledWith('hello', options);
});

test('should prefix key with baseKey and call t(key,  options) when second param is string', () => {
  const options = { ns: 'common' };

  const { result } = renderHook(() => useScopedTranslation('base'));

  result.current.t('missing', options as any);

  expect(mockT).toHaveBeenCalledTimes(1);
  expect(mockT).toHaveBeenCalledWith('missing', options);
});

test('should pass undefined options through when only key is provided', () => {
  const { result } = renderHook(() => useScopedTranslation('base'));

  result.current.t('onlyKey');

  expect(mockT).toHaveBeenCalledTimes(1);
  expect(mockT).toHaveBeenCalledWith('onlyKey', {"ns": "common"});
});
});
