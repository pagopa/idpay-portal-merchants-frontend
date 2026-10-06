export interface Data {
  initiativeId: string;
  initiativeName: string;
  organizationName: string;
  spendingPeriod?: string;
  serviceId?: string;
  status: string;
  onboardStatus: string;
  id: number;
}

const parseItalianDate = (value: string): number => {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return Number.NEGATIVE_INFINITY;
  }
  return new Date(year, month - 1, day).getTime();
};

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const dA = String((a[orderBy] as unknown as string | undefined) ?? '');
  const dB = String((b[orderBy] as unknown as string | undefined) ?? '');

  if (orderBy === 'spendingPeriod') {
    const dATime = parseItalianDate(dA);
    const dBTime = parseItalianDate(dB);
    if (dBTime < dATime) {
      return -1;
    }
    if (dBTime > dATime) {
      return 1;
    }
    return 0;
  }

  if (dB.toLowerCase() < dA.toLowerCase()) {
    return -1;
  }
  if (dB.toLowerCase() > dA.toLowerCase()) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';

export function getComparator<T, Key extends keyof T>(
  order: Order,
  orderBy: Key
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(array: ReadonlyArray<T>, comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  // eslint-disable-next-line functional/immutable-data
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

export interface EnhancedTableProps {
  order: Order;
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
}
