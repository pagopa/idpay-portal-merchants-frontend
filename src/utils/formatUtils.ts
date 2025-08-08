/* eslint-disable arrow-body-style */
import { format } from "date-fns";
import { MISSING_DATA_PLACEHOLDER } from "./constants";

export function formatDate(value: any) {
    return format(value, 'dd/MM/yyyy HH:mm');
}

// export const currencyFormatter = new Intl.NumberFormat('en-US', {
//   style: 'currency',
//   currency: 'USD',
// });

// export const currencyFormatter = (amount: number): string => {
//      // eslint-disable-next-line sonarjs/prefer-immediate-return
//      const temp=Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(amount);
//     return temp;
// };

export const currencyFormatter = (v: string) => v ? v + " €" : v;

export const formatValues=(v: string) => v ? v : MISSING_DATA_PLACEHOLDER;