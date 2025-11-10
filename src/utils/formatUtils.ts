import { format } from 'date-fns';
import { MISSING_DATA_PLACEHOLDER } from './constants';

export function formatDate(value: any) {
  return format(value, 'dd/MM/yyyy HH:mm');
}

export function safeFormatDate(value: any) {
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return MISSING_DATA_PLACEHOLDER;
    }
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch {
    return MISSING_DATA_PLACEHOLDER;
  }
}

export const curFormatter = (amount: number): string =>
  Intl.NumberFormat('it-EU', { style: 'currency', currency: 'EUR' }).format(amount);

export const currencyFormatter = (v: number) => (v || v === 0 ? curFormatter(v) : v);

export const formatValues = (v: string) => (v ? v : MISSING_DATA_PLACEHOLDER);

export const normalizeUrlHttps = (urlToNormalize?: string): string => {
  const trimmedUrl = urlToNormalize?.trim();
  if (!trimmedUrl) {
    return '';
  }
  if (trimmedUrl.startsWith('http://')) {
    return trimmedUrl.replace('http://', 'https://');
  }
  if (trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  return 'https://' + trimmedUrl;
};

export const normalizeUrlHttp = (url?: string): string =>
  !url || url.trim() === ''
    ? ''
    : url.trim().startsWith('http://') || url.trim().startsWith('https://')
    ? url.trim()
    : `http://${url.trim()}`;
