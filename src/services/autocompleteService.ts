
// import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { AutocompleteApi } from '../api/AutocompleteApiClient';
import { AddressAutocompleteRequestDTO } from '../api/generated/autocomplete/AddressAutocompleteRequestDTO';
import { AddressAutocompleteResponseDTO } from '../api/generated/autocomplete/AddressAutocompleteResponseDTO';


// export interface AutocompleteRequest {
//   QueryText: string;
//   AdditionalFeatures?: Array<string>;
// }

// export interface AutocompleteResponse {
//   ResultItems: Array<PlaceItem>;
// }

// export interface PlaceItem {
//   PlaceId: string;
//   PlaceType: string;
//   Title: string;
//   Address: Address;
//   Language: string;
//   Highlights?: Highlights;
// }

// export interface Address {
//   Label: string;
//   Country: {
//     Code2: string;
//     Code3: string;
//     Name: string;
//   };
//   Region: {
//     Name: string;
//   };
//   SubRegion?: {
//     Code: string;
//     Name: string;
//   };
//   Locality?: string;
//   District?: string;
//   PostalCode?: string;
//   Street?: string;
//   StreetComponents?: Array<StreetComponent>;
//   AddressNumber?: string;
// }

// export interface StreetComponent {
//   BaseName: string;
//   Type: string;
//   TypePlacement: string;
//   TypeSeparator: string;
//   Language: string;
// }
//
// export interface Highlights {
//   Title?: Array<HighlightFragment>;
//   Address?: {
//     Label?: Array<HighlightFragment>;
//     Street?: Array<HighlightFragment>;
//     AddressNumber?: Array<HighlightFragment>;
//   };
// }
//
// export interface HighlightFragment {
//   StartIndex: number;
//   EndIndex: number;
//   Value: string;
// }

export const autocompleteService = {
  getAddresses: async (
    payload: AddressAutocompleteRequestDTO
  ): Promise<AddressAutocompleteResponseDTO> =>
     AutocompleteApi.getAddresses(payload)
  ,
};