import { renderHook } from '@testing-library/react-hooks';
import { useInitiativeConfig } from '../useInitiativeConfig';
import { buildNamespaceKey } from '../../utils/buildNamespaceKey';

jest.mock('../../utils/buildNamespaceKey');

const mockBuildNamespaceKey = buildNamespaceKey as jest.Mock;

describe('useInitiativeConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads config from dynamic initiative folder when import succeeds', async () => {
    mockBuildNamespaceKey.mockReturnValue('test-initiative');

    jest.mock(
      '../../locale/it/test-initiative/config.json',
      () => ({
        __esModule: true,
        default: {
          routes: ['a', 'b'],
        },
      }),
      { virtual: true }
    );

    const { result } = renderHook(() => useInitiativeConfig<string[]>());

    const config = await result.current.getConfig('routes' as any, {
      initiativeName: 'Test',
      startDate: '2024-01-01',
    } as any);

    expect(mockBuildNamespaceKey).toHaveBeenCalledWith(
      'Test',
      '2024-01-01'
    );

    expect(config).toEqual(['a', 'b']);
  });

  it('falls back to default config when dynamic import fails', async () => {
    mockBuildNamespaceKey.mockReturnValue('non-existent');

    const { result } = renderHook(() => useInitiativeConfig<string[]>());

    const config = await result.current.getConfig('routes' as any, {
      initiativeName: 'X',
      startDate: 'Y',
    } as any);

    expect(mockBuildNamespaceKey).toHaveBeenCalledWith('X', 'Y');
    expect(config).toBeDefined();
  });

  it('handles missing initiative fields using empty strings', async () => {
    mockBuildNamespaceKey.mockReturnValue('empty');

    const { result } = renderHook(() => useInitiativeConfig<string[]>());

    await result.current.getConfig('routes' as any, {
      initiativeName: undefined,
      startDate: undefined,
    } as any);

    expect(mockBuildNamespaceKey).toHaveBeenCalledWith('', '');
  });
});
