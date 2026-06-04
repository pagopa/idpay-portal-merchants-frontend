import { ENV } from '../utils/env';
import {
  AddressAutocompleteRequestDTO,
  AddressAutocompleteResponseDTO,
} from './generated/autocomplete/data-contracts';
import { Autocomplete } from './generated/autocomplete/Autocomplete';
import { axiosFetchAdapter } from './axiosFetchAdapter';

class AutocompleteApiClient {
  private autocompleteClient: Autocomplete;

  constructor() {
    this.autocompleteClient = new Autocomplete({
      baseUrl: `${ENV.URL_API.MERCHANTS}/address-search`,
      customFetch: axiosFetchAdapter,
    });
  }

  public async getAddresses(
    request: AddressAutocompleteRequestDTO
  ): Promise<AddressAutocompleteResponseDTO> {
    const response = await this.autocompleteClient.autocomplete(
      request,
      { format: 'json' }
    );
    return response.data;
  }
}

const client = new AutocompleteApiClient();

export const AutocompleteApi = {
  getAddresses: (
    request: AddressAutocompleteRequestDTO
  ): Promise<AddressAutocompleteResponseDTO> =>
    client.getAddresses(request,),
};
