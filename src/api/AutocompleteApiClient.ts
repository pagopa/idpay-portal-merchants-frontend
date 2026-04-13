import { ENV } from "../utils/env";
import { BaseApiClient } from "./BaseApiClient";
import {
  AddressAutocompleteRequestDTO,
  AddressAutocompleteResponseDTO,
} from "./generated/autocomplete/data-contracts";

class AutocompleteApiClient {
  private baseClient: BaseApiClient;

  constructor() {
    this.baseClient = new BaseApiClient({
      baseUrl: `${ENV.URL_API.MERCHANTS}/address-search`,
    });
  }

  public async getAddresses(
    request: AddressAutocompleteRequestDTO
  ): Promise<AddressAutocompleteResponseDTO> {
    const httpResponse = await this.baseClient.safeRequest<
      AddressAutocompleteResponseDTO
    >({
      path: "/autocomplete",
      method: "POST",
      body: request,
      format: "json",
      secure: true,
    });

    return httpResponse.data;
  }
}

const client = new AutocompleteApiClient();

export const AutocompleteApi = {
  getAddresses: (
    request: AddressAutocompleteRequestDTO
  ): Promise<AddressAutocompleteResponseDTO> =>
    client.getAddresses(request),
};
