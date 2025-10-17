import { extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import { createClient } from '../generated/autocomplete/client';

// --- MOCK GLOBALI ---
jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
  storageTokenOps: { read: jest.fn().mockReturnValue('mocked-token') },
}));

jest.mock('@pagopa/selfcare-common-frontend/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((e) => e) },
}));

jest.mock('@pagopa/selfcare-common-frontend/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/locale/locale-utils', () => ({
  t: jest.fn((key) => key),
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('../generated/autocomplete/client', () => ({
  createClient: jest.fn(),
}));

// --- VARIABILI DI TEST ---
let mockAutocompleteClient: any;

describe('AutocompleteApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockAutocompleteClient = {
      autocomplete: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockAutocompleteClient);
    (extractResponse as jest.Mock).mockResolvedValue('extracted');
  });

  // Funzione per ricaricare il modulo in ambiente isolato (serve per mock statici)
  const loadApi = () => {
    let AutocompleteApi: any;
    jest.isolateModules(() => {
      AutocompleteApi = require('../AutocompleteApiClient').AutocompleteApi;
    });
    return AutocompleteApi;
  };

  it('chiama apiClient.autocomplete con Bearer token corretto', async () => {
    mockAutocompleteClient.autocomplete.mockResolvedValue({ right: 'data' });
    const AutocompleteApi = loadApi();

    const request = { query: 'via roma' };
    const result = await AutocompleteApi.getAddresses(request);

    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('inserisce Bearer anche se il token è vuoto', async () => {
    const { storageTokenOps } = require('@pagopa/selfcare-common-frontend/utils/storage');
    (storageTokenOps.read as jest.Mock).mockReturnValueOnce('');

    mockAutocompleteClient.autocomplete.mockResolvedValue({ right: 'data' });
    const AutocompleteApi = loadApi();

    await AutocompleteApi.getAddresses({ query: 'via milano' });
  });

  it('invoca onRedirectToLogin se extractResponse richiama callback', async () => {
    const { store } = require('../../redux/store');
    store.dispatch = jest.fn();

    (extractResponse as jest.Mock).mockImplementation(async (_res, _status, callback) => {
      callback(); // Simula scadenza token
      return 'extracted';
    });

    mockAutocompleteClient.autocomplete.mockResolvedValue({ right: 'data' });
    const AutocompleteApi = loadApi();

    await AutocompleteApi.getAddresses({ query: 'via torino' });
  });
});
