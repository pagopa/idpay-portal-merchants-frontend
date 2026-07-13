import { formatAlreadyAssociatedAddress, formatStreetAddress } from '../../utils/addressUtils';

export type PointOfSaleFeedbackItem = {
  pointOfSaleId?: string;
  franchiseName?: string;
  type?: 'PHYSICAL' | 'ONLINE' | string;
  address?: string | null;
  city?: string | null;
  streetNumber?: string | null;
  website?: string | null;
};

type LabelOptions = {
  includeCity?: boolean;
};

const getPointOfSaleFeedbackDetail = (
  pointOfSale: PointOfSaleFeedbackItem,
  { includeCity = true }: LabelOptions = {}
) => {
  if (pointOfSale.type === 'ONLINE') {
    return pointOfSale.website;
  }

  return includeCity
    ? formatAlreadyAssociatedAddress(pointOfSale)
    : formatStreetAddress(pointOfSale, ' ') || pointOfSale.city;
};

export const getPointOfSaleFeedbackLabel = (
  pointOfSale: PointOfSaleFeedbackItem,
  options?: LabelOptions
) =>
  [pointOfSale.franchiseName, getPointOfSaleFeedbackDetail(pointOfSale, options)]
    .filter(Boolean)
    .join(' - ') || pointOfSale.pointOfSaleId;
