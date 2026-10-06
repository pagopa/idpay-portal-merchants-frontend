type PointOfSaleAddress = {
  address?: string | null;
  streetNumber?: string | null;
  zipCode?: string | null;
  city?: string | null;
  province?: string | null;
};

export const formatStreetAddress = (
  pointOfSale: Pick<PointOfSaleAddress, 'address' | 'streetNumber'>,
  streetNumberSeparator = ', '
) => [pointOfSale.address, pointOfSale.streetNumber].filter(Boolean).join(streetNumberSeparator);

export const formatCatalogDrawerAddress = (pointOfSale: PointOfSaleAddress) =>
  [
    formatStreetAddress(pointOfSale),
    [pointOfSale.zipCode, pointOfSale.city, pointOfSale.province].filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(' - ');

export const formatAlreadyAssociatedAddress = (pointOfSale: PointOfSaleAddress) =>
  [formatStreetAddress(pointOfSale, ' '), pointOfSale.city].filter(Boolean).join(', ');

export const formatInitiativeStoreDetailAddress = (pointOfSale: PointOfSaleAddress) =>
  formatStreetAddress(pointOfSale)
    .concat(` - ${pointOfSale.zipCode}`)
    .concat(`, ${pointOfSale.city}`)
    .concat(`, ${pointOfSale.province}`);
