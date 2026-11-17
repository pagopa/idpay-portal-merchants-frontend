import { renderHook } from '@testing-library/react-hooks';
import { useInitiativeConfig } from '../useInitiativeConfig';
import { getInitiativeResourceFolder } from '../../locale/initiativeResources';

jest.mock('../../locale/initiativeResources', () => ({
  getInitiativeResourceFolder: jest.fn(),
}));

const mockGetInitiativeResourceFolder = getInitiativeResourceFolder as jest.Mock;

describe('useInitiativeConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads config from dynamic initiative folder when import succeeds', async () => {
    mockGetInitiativeResourceFolder.mockReturnValue('test-initiative');

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

    const config = await result.current.getConfig(
      'routes' as any,
      {
        initiativeId: 'test-initiative-id',
        initiativeName: 'Test',
        startDate: '2028-01-01',
      } as any
    );

    expect(mockGetInitiativeResourceFolder).toHaveBeenCalledWith('test-initiative-id');

    expect(config).toEqual(['a', 'b']);
  });

  it('falls back to default config when dynamic import fails', async () => {
    mockGetInitiativeResourceFolder.mockReturnValue('non-existent');

    const { result } = renderHook(() => useInitiativeConfig<string[]>());

    const config = await result.current.getConfig(
      'routes' as any,
      {
        initiativeId: 'unknown-id',
        initiativeName: 'X',
        startDate: 'Y',
      } as any
    );

    expect(mockGetInitiativeResourceFolder).toHaveBeenCalledWith('unknown-id');
    expect(config).toBeDefined();
  });

  it('uses the default config when initiative ID is missing', async () => {
    const { result } = renderHook(() => useInitiativeConfig<string[]>());

    const config = await result.current.getConfig(
      'routes' as any,
      {
        initiativeName: undefined,
        startDate: undefined,
      } as any
    );

    expect(mockGetInitiativeResourceFolder).toHaveBeenCalledWith(undefined);
    expect(config).toBeDefined();
  });
});
