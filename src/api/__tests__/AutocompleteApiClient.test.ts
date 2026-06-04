var mockAutocompleteInstance: any;

jest.mock('../generated/autocomplete/Autocomplete', () => ({
  Autocomplete: jest.fn().mockImplementation(function (this: any) {
    this.autocomplete = jest.fn();
    mockAutocompleteInstance = this;
  }),
}));

import { AutocompleteApi } from '../AutocompleteApiClient';

describe('AutocompleteApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns response.data when call succeeds', async () => {
    const mockResponse = {
      ResultItems: [],
    };

    mockAutocompleteInstance.autocomplete.mockResolvedValue({
      data: mockResponse,
    });

    const result = await AutocompleteApi.getAddresses({
      QueryText: 'via roma',
    } as any);

    expect(result).toEqual(mockResponse);
    expect(mockAutocompleteInstance.autocomplete).toHaveBeenCalled();
  });

  it('propagates axios error', async () => {
    const error = new Error('Bad request');

    mockAutocompleteInstance.autocomplete.mockRejectedValue(error);

    await expect(
      AutocompleteApi.getAddresses({ QueryText: 'invalid' } as any)
    ).rejects.toThrow('Bad request');
  });
});
