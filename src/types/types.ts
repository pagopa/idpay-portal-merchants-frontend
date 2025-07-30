import { PointOfSaleDTO, TypeEnum } from '../api/generated/merchants/PointOfSaleDTO';

export interface GetPointOfSalesFilters {
    type?: TypeEnum.PHYSICAL | TypeEnum.ONLINE;
    city?: string;
    address?: string;
    contactName?: string;
    page?: number;
    size?: number;
    sort: string;
}

export interface GetPointOfSalesResponse {
    content: Array<PointOfSaleDTO>;
    number: number;
    pageSize: number;
    pageNo: number;
    totalElements: number;
    totalPages: number;
}
    