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

export interface UploadedFile {
  fileName: string;
  url: string;
}

export interface Variant {
  id: number;
  product_id: number;
  title: string;
  available_quantity: number;
  on_hand_quantity: number;
  product_variant_image: string[];
  code: string;
  fake_price: string;
  price: string;
  status: "active" | "inactive";
  createdAt?: string;
}

export interface AttributeSetReference {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  title: string;
  status: "active" | "inactive";
  description: string;
  product_image: string;
  meta_title: string;
  meta_key: string;
  meta_description: string;
  vendor: {
    id: number;
    full_name: string;
  };
  attribute_set: AttributeSetReference;
  variants: Variant[];
  createdAt: string;
  variantAttributes: Attribute[];
}

export type VariantPayload = Omit<
  Variant,
  "id" | "product_id" | "createdAt" | "price" | "fake_price"
> & {
  id?: number;
  price: number;
  fake_price: number;
};

export interface ProductPayload {
  title: string;
  status: "active" | "inactive";
  description: string;
  product_image: string;
  meta_title?: string;
  meta_key?: string;
  meta_description?: string;
  auth_vendor_id: number;
  attribute_set_id: number;
  variants: VariantPayload[];
  variantAttributes?: Attribute[];
}
