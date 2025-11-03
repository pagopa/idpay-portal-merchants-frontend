import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

export function isValidCF(cf: string): boolean {
  if (!cf) {
    return false;
  }
  if (/^[A-Za-z]{16}$/.test(cf) || /^[0-9]{16}$/.test(cf)) {
    return false;
  }
  return /^[A-Z0-9]{16}$/i.test(cf);
}

export function normalizeValue(val: unknown): string {
  if (val === null || val === undefined) {
    return MISSING_DATA_PLACEHOLDER;
  }
  if (typeof val === 'string') {
    return val === '' ? MISSING_DATA_PLACEHOLDER : val;
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  return String(val);
}
