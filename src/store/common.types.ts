import { PAGINATION_CONFIG } from "../utils/constants";

export interface PaginationRequest {
  sortValue?: "asc" | "desc";
  sortKey?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationData<T> {
  rows: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  numberOfRows: number;
}

export const DEFAULT_PARAMS: PaginationRequest = {
  page: PAGINATION_CONFIG.DEFAULT_PAGE,
  limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
  sortKey: PAGINATION_CONFIG.DEFAULT_SORT_KEY,
  sortValue: PAGINATION_CONFIG.DEFAULT_SORT_VALUE,
};

export const EMPTY_PAGINATION = {
  totalItems: 0,
  totalPages: 0,
  currentPage: PAGINATION_CONFIG.DEFAULT_PAGE,
  pageSize: PAGINATION_CONFIG.DEFAULT_LIMIT,
  numberOfRows: 0,
};

export interface Attribute {
  id: number;
  name: string;
}

export interface AttributeSet {
  id: number;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  attributes: Attribute[];
}
