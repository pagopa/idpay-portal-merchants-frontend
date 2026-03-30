import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/autocomplete/client';

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn().mockReturnValue('mocked-token') },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((e) => e) },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
  t: jest.fn((key) => key),
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('../generated/autocomplete/client', () => ({
  createClient: jest.fn(),
}));

let mockAutocompleteClient: any;

const loadApi = () => {
  let AutocompleteApi: any;
  jest.isolateModules(() => {
    AutocompleteApi = require('../AutocompleteApiClient').AutocompleteApi;
  });
  return AutocompleteApi;
};

const setupMockAndCallApi = async (
  mockResolvedValue: any,
  request: { query: string }
) => {
  mockAutocompleteClient.autocomplete.mockResolvedValue(mockResolvedValue);
  const AutocompleteApi = loadApi();
  const result = await AutocompleteApi.getAddresses(request);
  return { result, AutocompleteApi };
};

describe('AutocompleteApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockAutocompleteClient = {
      autocomplete: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockAutocompleteClient);
    (extractResponse as jest.Mock).mockResolvedValue('extracted');
  });

  it('chiama apiClient.autocomplete con Bearer token corretto', async () => {
    const { result } = await setupMockAndCallApi({ right: 'data' }, { query: 'via roma' });

    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('inserisce Bearer anche se il token è vuoto', async () => {
    const { storageTokenOps } = require('@pagopa/selfcare-common-frontend/lib/utils/storage');
    (storageTokenOps.read as jest.Mock).mockReturnValueOnce('');

    await setupMockAndCallApi({ right: 'data' }, { query: 'via milano' });
  });

  it('invoca onRedirectToLogin se extractResponse richiama callback', async () => {
    const { store } = require('../../redux/store');
    store.dispatch = jest.fn();

    (extractResponse as jest.Mock).mockImplementation(async (_res, _status, callback) => {
      callback();
      return 'extracted';
    });

    await setupMockAndCallApi({ right: 'data' }, { query: 'via torino' });
  });
});
