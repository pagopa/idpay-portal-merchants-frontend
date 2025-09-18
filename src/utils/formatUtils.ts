import { format } from "date-fns";
import { MISSING_DATA_PLACEHOLDER } from "./constants";

export function formatDate(value: any) {
    return format(value, 'dd/MM/yyyy HH:mm');
}

export const curFormatter = (amount: number): string => Intl.NumberFormat('it-EU', {style: 'currency', currency: 'EUR'}).format(amount);


export const currencyFormatter = (v: number) => v||v===0 ? curFormatter(v) : v;

export const formatValues=(v: string) => v ? v : MISSING_DATA_PLACEHOLDER;

export const normalizeUrlHttps = (url?: string): string => url?.trim().startsWith('http') || url?.trim().startsWith('https')  ? url?.trim() : `https://${url?.trim()}`;

export const normalizeUrlHttp = (url?: string): string => url?.trim().startsWith('http')  ? url?.trim() : `http://${url?.trim()}`;