export interface GetPointOfSalesFilters {
  initiative?: string;
  type?: 'PHYSICAL' | 'ONLINE';
  city?: string;
  address?: string;
  contactName?: string;
  page?: number;
  size?: number;
  sort: string;
}

export interface GetReportedUsersFilters {
  cf: string;
  gtin?: string;
  status?: string;
  page?: number;
  size?: number;
  sort: string;
}

export interface GetPointOfSaleTransactionsFilters {
  page?: number;
  size?: number;
  sort?: string;
  fiscalCode?: string;
  status?: string;
  productGtin?: string;
  trxCode?: string;
}

export interface SalePointFormDTO {
  address?: string;

  channelEmail?: string;

  channelGeolink?: string;

  channelPhone?: string;

  channelWebsite?: string;

  city?: string;

  contactEmail?: string;

  confirmContactEmail?: string;

  contactName?: string;

  contactSurname?: string;

  franchiseName?: string;

  id?: string;

  province?: string;

  region?: string;

  streetNumber?: string;

  type?: string;

  website?: string;

  zipCode?: string;
}
