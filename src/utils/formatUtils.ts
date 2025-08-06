import { format } from "date-fns";

export function formatDate(value: any) {
    return format(value, 'dd/MM/yyyy HH:mm');
}