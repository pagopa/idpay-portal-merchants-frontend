import { renderHook } from '@testing-library/react-hooks';
import { buildNamespaceKey } from '../../utils/buildNamespaceKey';
import useScopedTranslation from '../useScopedTranslation';
import { useInitiativeConfig } from '../useInitiativeConfig';

jest.mock('../useScopedTranslation');
jest.mock('../../utils/buildNamespaceKey');

const mockUseScopedTranslation = useScopedTranslation as jest.Mock;
const mockBuildNamespaceKey = buildNamespaceKey as jest.Mock;

describe('useInitiativeConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useScopedTranslation with only fileName when namespace is undefined', () => {
    mockUseScopedTranslation.mockReturnValue({
      t: jest.fn().mockReturnValue({ test: 'value' }),
    });

    renderHook(() => useInitiativeConfig('config.key'));

    expect(mockUseScopedTranslation).toHaveBeenCalledWith({
      fileName: 'config',
    });
  });

  it('should build initiativeName and pass it to useScopedTranslation when namespace is provided', () => {
    mockBuildNamespaceKey.mockReturnValue('builtKey');
    mockUseScopedTranslation.mockReturnValue({
      t: jest.fn().mockReturnValue({ test: 'value' }),
    });

    renderHook(() =>
      useInitiativeConfig('config.key', {
        initiativeName: 'My Initiative',
        startDate: '2024-01-01',
      })
    );

    expect(mockBuildNamespaceKey).toHaveBeenCalledWith(
      'My Initiative',
      '2024-01-01'
    );

    expect(mockUseScopedTranslation).toHaveBeenCalledWith({
      fileName: 'config',
      initiativeName: 'builtKey',
    });
  });

  it('should handle undefined namespace fields using nullish coalescing', () => {
    mockBuildNamespaceKey.mockReturnValue('emptyBuiltKey');
    mockUseScopedTranslation.mockReturnValue({
      t: jest.fn().mockReturnValue({}),
    });

    renderHook(() =>
      useInitiativeConfig('config.key', {
        initiativeName: undefined as any,
        startDate: undefined as any,
      })
    );

    expect(mockBuildNamespaceKey).toHaveBeenCalledWith('', '');
  });

  it('should return initiativeConfig from translation with returnObjects true', () => {
    const mockConfig = { a: 1 };
    const mockT = jest.fn().mockReturnValue(mockConfig);

    mockUseScopedTranslation.mockReturnValue({
      t: mockT,
    });

    const { result } = renderHook(() =>
      useInitiativeConfig<typeof mockConfig>('config.key')
    );

    expect(mockT).toHaveBeenCalledWith('config.key', {
      returnObjects: true,
    });

    expect(result.current.initiativeConfig).toEqual(mockConfig);
  });
});
