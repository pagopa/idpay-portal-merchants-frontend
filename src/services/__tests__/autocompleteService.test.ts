import { AutocompleteApi } from '../../api/AutocompleteApiClient';
import {
  AddressAutocompleteRequestDTO,
  AddressAutocompleteResponseDTO,
} from '../../api/generated/autocomplete/data-contracts';
import { autocompleteService } from '../autocompleteService';

jest.mock('../../api/AutocompleteApiClient', () => ({
  AutocompleteApi: {
    getAddresses: jest.fn(),
  },
}));

const mockedAutocompleteApi = AutocompleteApi as jest.Mocked<typeof AutocompleteApi>;

describe('autocompleteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAddresses', () => {
    test('should call AutocompleteApi.getAddresses with the correct payload and return the response', async () => {
      const mockPayload: AddressAutocompleteRequestDTO = {
        QueryText: 'via roma',
      };
      const mockResponse: AddressAutocompleteResponseDTO = {
        ResultItems: [
          {
            PlaceId: '1',
            Address: {
              Street: 'Via Roma',
              AddressNumber: '1',
              Locality: 'Roma',
              PostalCode: '00100',
            },
          },
        ],
      };
      mockedAutocompleteApi.getAddresses.mockResolvedValue(mockResponse);

      const result = await autocompleteService.getAddresses(mockPayload);

      expect(mockedAutocompleteApi.getAddresses).toHaveBeenCalledTimes(1);
      expect(mockedAutocompleteApi.getAddresses).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual(mockResponse);
    });

    test('should throw an error if the API call fails', async () => {
      const mockPayload: AddressAutocompleteRequestDTO = {
        QueryText: 'via roma',
      };
      const mockError = new Error('API request failed');
      mockedAutocompleteApi.getAddresses.mockRejectedValue(mockError);

      await expect(autocompleteService.getAddresses(mockPayload)).rejects.toThrow(mockError);

      expect(mockedAutocompleteApi.getAddresses).toHaveBeenCalledTimes(1);
      expect(mockedAutocompleteApi.getAddresses).toHaveBeenCalledWith(mockPayload);
    });
  });
});
