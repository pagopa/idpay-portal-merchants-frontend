import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/autocomplete/client';

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: vi.fn().mockReturnValue('mocked-token') },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: vi.fn((e) => e) },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: vi.fn(),
  extractResponse: vi.fn(),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
  t: vi.fn((key) => key),
}));

vi.mock('../../redux/store', () => ({
  store: { dispatch: vi.fn() },
}));

vi.mock('../generated/autocomplete/client', () => ({
  createClient: vi.fn(),
}));

let mockAutocompleteClient: any;

describe('AutocompleteApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAutocompleteClient = {
      autocomplete: vi.fn(),
    };

    (createClient as unknown as Mock).mockReturnValue(mockAutocompleteClient);
    (extractResponse as unknown as Mock).mockResolvedValue('extracted');
  });

  const loadApi = async () => {
    const module = await import('../AutocompleteApiClient');
    return module.AutocompleteApi;
  };

  it('chiama apiClient.autocomplete con Bearer token corretto', async () => {
    mockAutocompleteClient.autocomplete.mockResolvedValue({ right: 'data' });
    const AutocompleteApi = await loadApi();

    const request = { QueryText: 'via roma' } as any;
    const result = await AutocompleteApi.getAddresses(request);

    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('inserisce Bearer anche se il token è vuoto', async () => {
    const { storageTokenOps } = await import('@pagopa/selfcare-common-frontend/lib/utils/storage');
    (storageTokenOps.read as unknown as Mock).mockReturnValueOnce('');

    mockAutocompleteClient.autocomplete.mockResolvedValue({ right: 'data' });
    const AutocompleteApi = await loadApi();

    await AutocompleteApi.getAddresses({ QueryText: 'via milano' } as any);
  });

  it('invoca onRedirectToLogin se extractResponse richiama callback', async () => {
    const { store } = await import('../../redux/store');
    store.dispatch = vi.fn();

    (extractResponse as unknown as Mock).mockImplementation(async (_res, _status, callback) => {
      callback();
      return 'extracted';
    });

    mockAutocompleteClient.autocomplete.mockResolvedValue({ right: 'data' });
    const AutocompleteApi = await loadApi();

    await AutocompleteApi.getAddresses({ QueryText: 'via torino' } as any);
  });
});
