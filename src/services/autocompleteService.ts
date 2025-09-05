import axios from "axios";
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';

const BASE_URL = "https://places.geo.eu-central-1.amazonaws.com/v2";

export interface AutocompleteRequest {
  QueryText: string;
  AdditionalFeatures?: Array<string>;
}

export interface AutocompleteResponse {
  ResultItems: Array<PlaceItem>;
}

export interface PlaceItem {
  PlaceId: string;
  PlaceType: string;
  Title: string;
  Address: Address;
  Language: string;
  Highlights?: Highlights;
}

export interface Address {
  Label: string;
  Country: {
    Code2: string;
    Code3: string;
    Name: string;
  };
  Region: {
    Name: string;
  };
  SubRegion?: {
    Code: string;
    Name: string;
  };
  Locality?: string;
  District?: string;
  PostalCode?: string;
  Street?: string;
  StreetComponents?: Array<StreetComponent>;
  AddressNumber?: string;
}

export interface StreetComponent {
  BaseName: string;
  Type: string;
  TypePlacement: string;
  TypeSeparator: string;
  Language: string;
}

export interface Highlights {
  Title?: Array<HighlightFragment>;
  Address?: {
    Label?: Array<HighlightFragment>;
    Street?: Array<HighlightFragment>;
    AddressNumber?: Array<HighlightFragment>;
  };
}

export interface HighlightFragment {
  StartIndex: number;
  EndIndex: number;
  Value: string;
}

export const autocompleteService = {
  places: async (
    payload: AutocompleteRequest
  ): Promise<AutocompleteResponse> => {
    const token = storageTokenOps.read();
    const res = await axios.post<AutocompleteResponse>(
      `${BASE_URL}/autocomplete?key=${payload.QueryText}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },
};