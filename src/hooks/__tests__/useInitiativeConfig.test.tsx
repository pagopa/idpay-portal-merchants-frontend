import { renderHook } from '@testing-library/react-hooks';
import { useInitiativeConfig } from '../useInitiativeConfig';
import { getInitiativeResourceFolder } from '../../locale/initiativeResources';
import defaultConfig from '../../locale/it/default/config.json';

jest.mock('../../locale/initiativeResources', () => ({
  getInitiativeResourceFolder: jest.fn(),
}));

const mockGetInitiativeResourceFolder = getInitiativeResourceFolder as jest.Mock;

describe('useInitiativeConfig', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    expect(config).toEqual(defaultConfig.routes);
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
    expect(config).toEqual(defaultConfig.routes);
  });

  it('enables the default routes for an unmapped initiative ID', async () => {
    mockGetInitiativeResourceFolder.mockReturnValue(undefined);

    const { result } = renderHook(() => useInitiativeConfig<Array<string>>());
    const routes = await result.current.getConfig('routes', {
      initiativeId: 'default-initiative-id',
      initiativeName: 'Bonus Decoder',
      startDate: '2026-01-01',
    } as any);

    expect(mockGetInitiativeResourceFolder).toHaveBeenCalledWith('default-initiative-id');
    expect(routes).toEqual(defaultConfig.routes);
    expect(routes).toContain('reportedUsers');
    expect(routes).toContain('refundRequests');
  });

  it('uses default settings when an existing initiative config omits the key', async () => {
    mockGetInitiativeResourceFolder.mockReturnValue('bonusDecoder2026');

    const { result } = renderHook(() => useInitiativeConfig<typeof defaultConfig.regex>());
    const regex = await result.current.getConfig('regex', {
      initiativeId: 'configured-decoder-id',
    } as any);

    expect(regex).toEqual(defaultConfig.regex);
  });

  it('keeps the route selection of a mapped initiative', async () => {
    mockGetInitiativeResourceFolder.mockReturnValue('bonusDecoder2026');

    const { result } = renderHook(() => useInitiativeConfig<Array<string>>());
    const routes = await result.current.getConfig('routes', {
      initiativeId: 'configured-decoder-id',
    } as any);

    expect(routes).toContain('refundRequests');
    expect(routes).not.toContain('reportedUsers');
  });
});
