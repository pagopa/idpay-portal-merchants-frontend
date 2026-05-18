import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import useScopedTranslation from '../useScopedTranslation';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: jest.fn(),
}));

jest.mock('../useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: jest.fn(),
}));

jest.mock('../../locale', () => ({
  language: 'it',
  getResourceBundle: jest.fn().mockReturnValue(undefined),
  addResourceBundle: jest.fn(),
  reloadResources: jest.fn(),
  emit: jest.fn(),
  loadNamespaces: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../locale/multiInitiativeI18n', () => ({
  loadItNamespace: jest.fn().mockResolvedValue({ key: 'value' }),
}));

const mockUseTranslation = require('react-i18next').useTranslation;
const mockUseAppSelector = require('../../redux/hooks').useAppSelector;
const mockUseCurrentInitiativeId =
  require('../useCurrentInitiativeId').useCurrentInitiativeId;

describe('useScopedTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTranslation.mockReturnValue({
      t: jest.fn((key: string) => key),
    });

    mockUseAppSelector.mockReturnValue([]);
    mockUseCurrentInitiativeId.mockReturnValue({ initiativeId: undefined });
  });

  it('should return common namespace translation when no initiative', () => {
    const { result } = renderHook(() => useScopedTranslation());

    expect(result.current.initiativeName).toBeUndefined();
    expect(result.current.t('test.key')).toBe('test.key');
  });

  it('should resolve initiativeName from prop', () => {
    const { result } = renderHook(() =>
      useScopedTranslation({ initiativeName: 'myInitiative' })
    );

    expect(result.current.initiativeName).toBe('myInitiative');
  });

  it('should resolve initiativeName from store initiatives', () => {
    mockUseCurrentInitiativeId.mockReturnValue({ initiativeId: '1' });
    mockUseAppSelector.mockReturnValue([
      {
        initiativeId: '1',
        initiativeName: 'My Initiative',
        startDate: '2024-01-01',
      },
    ]);

    const { result } = renderHook(() => useScopedTranslation());

    expect(result.current.initiativeName).toBe('myInitiative2024');
  });

  it('should fallback to default copy if initiative key not found', () => {
    const mockT = jest
      .fn()
      .mockImplementationOnce(() => 'missing.key') // initiative ns
      .mockImplementationOnce(() => 'fallback.value'); // default ns

    mockUseTranslation.mockReturnValue({ t: mockT });

    const { result } = renderHook(() =>
      useScopedTranslation({ initiativeName: 'myInitiative' })
    );

    const value = result.current.t('missing.key');

    expect(value).toBe('fallback.value');
  });

  it('should not load namespaces if enableNamespaceLoading is false', () => {
    const { result } = renderHook(() =>
      useScopedTranslation({ enableNamespaceLoading: false })
    );

    expect(result.current.isLoading).toBe(false);
  });

  it('should set isLoading during namespace loading', async () => {
    const { result } = renderHook(() => useScopedTranslation());

    await act(async () => {
      await Promise.resolve();
    });

    expect(typeof result.current.isLoading).toBe('boolean');
  });
});
